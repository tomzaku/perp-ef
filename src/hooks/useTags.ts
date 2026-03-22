import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';
import { syncRemote } from '../lib/persist';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const DEFAULT_TAGS = ['failed', 'success', '15 mins', '30 mins', '1 hour', 'must try again'];
const DEFAULT_TAG_SET = new Set(DEFAULT_TAGS);

interface TagsState {
  tagNames: string[];
  questionTags: Record<string, string[]>;
  _synced: boolean;

  createTag: (name: string, userId?: string) => void;
  deleteTag: (name: string, userId?: string) => void;
  renameTag: (oldName: string, newName: string, userId?: string) => void;

  addTag: (questionId: string, tag: string, userId?: string) => void;
  removeTag: (questionId: string, tag: string, userId?: string) => void;
  toggleTag: (questionId: string, tag: string, userId?: string) => void;

  getTags: (questionId: string) => string[];
  getQuestionsByTag: (tag: string) => string[];

  _mergeRemote: (remoteTagNames: string[], remoteQuestionTags: { question_id: string; tag_name: string }[], userId: string) => void;
}

export const useTagsStore = create<TagsState>()(
  persist(
    (set, get) => ({
      tagNames: DEFAULT_TAGS,
      questionTags: {},
      _synced: false,

      createTag: (name: string, userId?: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const { tagNames } = get();
        if (tagNames.includes(trimmed)) return;
        set({ tagNames: [...tagNames, trimmed] });

        syncRemote(userId, (db, uid) =>
          db.from('user_tag_names').upsert(
            { user_id: uid, name: trimmed, sort_order: tagNames.length },
            { onConflict: 'user_id,name' },
          ),
        );
      },

      deleteTag: (name: string, userId?: string) => {
        if (DEFAULT_TAG_SET.has(name)) return;
        const { tagNames, questionTags } = get();
        const next: Record<string, string[]> = {};
        for (const [qid, tags] of Object.entries(questionTags)) {
          const filtered = tags.filter((t) => t !== name);
          if (filtered.length > 0) next[qid] = filtered;
        }
        set({
          tagNames: tagNames.filter((t) => t !== name),
          questionTags: next,
        });

        syncRemote(userId, async (db, uid) => {
          await db.from('user_question_tags').delete().eq('user_id', uid).eq('tag_name', name);
          await db.from('user_tag_names').delete().eq('user_id', uid).eq('name', name);
        });
      },

      renameTag: (oldName: string, newName: string, userId?: string) => {
        if (DEFAULT_TAG_SET.has(oldName)) return;
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        const { tagNames, questionTags } = get();
        if (tagNames.includes(trimmed)) return;
        const next: Record<string, string[]> = {};
        for (const [qid, tags] of Object.entries(questionTags)) {
          next[qid] = tags.map((t) => (t === oldName ? trimmed : t));
        }
        set({
          tagNames: tagNames.map((t) => (t === oldName ? trimmed : t)),
          questionTags: next,
        });

        syncRemote(userId, async (db, uid) => {
          // Update tag name
          await db.from('user_tag_names').update({ name: trimmed }).eq('user_id', uid).eq('name', oldName);
          // Update all question-tag assignments
          await db.from('user_question_tags').update({ tag_name: trimmed }).eq('user_id', uid).eq('tag_name', oldName);
        });
      },

      addTag: (questionId: string, tag: string, userId?: string) => {
        const { questionTags } = get();
        const current = questionTags[questionId] || [];
        if (current.includes(tag)) return;
        set({
          questionTags: { ...questionTags, [questionId]: [...current, tag] },
        });

        syncRemote(userId, (db, uid) =>
          db.from('user_question_tags').upsert(
            { user_id: uid, question_id: questionId, tag_name: tag },
            { onConflict: 'user_id,question_id,tag_name' },
          ),
        );
      },

      removeTag: (questionId: string, tag: string, userId?: string) => {
        const { questionTags } = get();
        const current = questionTags[questionId] || [];
        const filtered = current.filter((t) => t !== tag);
        const next = { ...questionTags };
        if (filtered.length > 0) {
          next[questionId] = filtered;
        } else {
          delete next[questionId];
        }
        set({ questionTags: next });

        syncRemote(userId, (db, uid) =>
          db.from('user_question_tags').delete()
            .eq('user_id', uid)
            .eq('question_id', questionId)
            .eq('tag_name', tag),
        );
      },

      toggleTag: (questionId: string, tag: string, userId?: string) => {
        const { questionTags } = get();
        const current = questionTags[questionId] || [];
        if (current.includes(tag)) {
          get().removeTag(questionId, tag, userId);
        } else {
          get().addTag(questionId, tag, userId);
        }
      },

      getTags: (questionId: string) => get().questionTags[questionId] || [],

      getQuestionsByTag: (tag: string) => {
        const { questionTags } = get();
        return Object.entries(questionTags)
          .filter(([, tags]) => tags.includes(tag))
          .map(([qid]) => qid);
      },

      _mergeRemote: (remoteTagNames, remoteQuestionTags, userId) => {
        const { tagNames, questionTags } = get();

        // Merge tag names
        const mergedNames = [...new Set([...tagNames, ...remoteTagNames])];

        // Merge question tags
        const merged: Record<string, Set<string>> = {};
        // Local
        for (const [qid, tags] of Object.entries(questionTags)) {
          merged[qid] = new Set(tags);
        }
        // Remote
        for (const row of remoteQuestionTags) {
          if (!merged[row.question_id]) merged[row.question_id] = new Set();
          merged[row.question_id].add(row.tag_name);
        }

        const mergedQuestionTags: Record<string, string[]> = {};
        for (const [qid, tags] of Object.entries(merged)) {
          mergedQuestionTags[qid] = [...tags];
        }

        // Push local-only tag names to Supabase
        const remoteNameSet = new Set(remoteTagNames);
        const localOnlyNames = tagNames.filter((n) => !remoteNameSet.has(n));
        if (localOnlyNames.length > 0) {
          syncRemote(userId, (db, uid) =>
            db.from('user_tag_names').upsert(
              localOnlyNames.map((name, i) => ({
                user_id: uid,
                name,
                sort_order: remoteTagNames.length + i,
              })),
              { onConflict: 'user_id,name' },
            ),
          );
        }

        // Push local-only question tags to Supabase
        const remoteQTSet = new Set(remoteQuestionTags.map((r) => `${r.question_id}::${r.tag_name}`));
        const localOnlyQT: { user_id: string; question_id: string; tag_name: string }[] = [];
        for (const [qid, tags] of Object.entries(questionTags)) {
          for (const tag of tags) {
            if (!remoteQTSet.has(`${qid}::${tag}`)) {
              localOnlyQT.push({ user_id: userId, question_id: qid, tag_name: tag });
            }
          }
        }
        if (localOnlyQT.length > 0) {
          syncRemote(userId, (db) =>
            db.from('user_question_tags').upsert(localOnlyQT, {
              onConflict: 'user_id,question_id,tag_name',
            }),
          );
        }

        set({
          tagNames: mergedNames,
          questionTags: mergedQuestionTags,
          _synced: true,
        });
      },
    }),
    {
      name: 'fe-interview-tags',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tagNames: state.tagNames,
        questionTags: state.questionTags,
      }),
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<TagsState>) };
        // Ensure default tags are always present
        const names = new Set(state.tagNames);
        for (const tag of DEFAULT_TAGS) {
          if (!names.has(tag)) state.tagNames = [...state.tagNames, tag];
        }
        return state;
      },
    },
  ),
);

/** Hook that syncs the store with Supabase on login and provides a convenient API. */
export function useTags(): TagsState & { userId?: string } {
  const { user } = useAuth();
  const store = useTagsStore();

  useEffect(() => {
    if (!user || !supabase || store._synced) return;

    let cancelled = false;

    async function fetchTags() {
      const [tagNamesRes, questionTagsRes] = await Promise.all([
        supabase!.from('user_tag_names').select('name, sort_order').eq('user_id', user!.id).order('sort_order'),
        supabase!.from('user_question_tags').select('question_id, tag_name').eq('user_id', user!.id),
      ]);

      if (cancelled || tagNamesRes.error || questionTagsRes.error) return;

      store._mergeRemote(
        (tagNamesRes.data || []).map((r) => r.name),
        (questionTagsRes.data || []) as { question_id: string; tag_name: string }[],
        user!.id,
      );
    }

    fetchTags();
    return () => { cancelled = true; };
  }, [user, store._synced]);

  // Wrap mutators to pass userId
  return {
    ...store,
    userId: user?.id,
    createTag: (name: string) => store.createTag(name, user?.id),
    deleteTag: (name: string) => store.deleteTag(name, user?.id),
    renameTag: (oldName: string, newName: string) => store.renameTag(oldName, newName, user?.id),
    addTag: (qid: string, tag: string) => store.addTag(qid, tag, user?.id),
    removeTag: (qid: string, tag: string) => store.removeTag(qid, tag, user?.id),
    toggleTag: (qid: string, tag: string) => store.toggleTag(qid, tag, user?.id),
  };
}
