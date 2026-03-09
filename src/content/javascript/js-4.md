---
id: js-4
title: Event Delegation and Bubbling
category: JavaScript
subcategory: "DOM & Events"
difficulty: Easy
pattern: Event Handling
companies: [Meta, Amazon]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Event delegation leverages event bubbling by attaching a single listener to a parent element instead of multiple listeners on children. Use event.target to identify the actual element clicked, and event.currentTarget for the element the listener is on. This pattern improves performance and handles dynamically added elements automatically."
similarProblems: [js-5, js-14, js-3]
---

Explain DOM event propagation and event delegation:

1. The three phases of event propagation (capture, target, bubble)
2. How event delegation works and why it's useful
3. Implementing event delegation with practical examples
4. event.stopPropagation() vs event.stopImmediatePropagation()
5. event.target vs event.currentTarget

## Examples

**Input:** Click on a <li> inside a <ul> with one event listener on the <ul>
**Output:** The <ul> handler fires and event.target identifies which <li> was clicked
*Event delegation uses bubbling to handle events on a parent rather than attaching listeners to each child.*


## Solution

```js
// ============================================
// 1. Event Propagation Phases
// ============================================
// Phase 1: CAPTURE — event travels from window down to target
// Phase 2: TARGET — event reaches the target element
// Phase 3: BUBBLE — event travels back up from target to window

/*
  <div id="grandparent">
    <div id="parent">
      <button id="child">Click me</button>
    </div>
  </div>
*/

// Demonstrating all three phases:
document.getElementById('grandparent').addEventListener(
  'click',
  () => console.log('Grandparent: CAPTURE phase'),
  true // useCapture = true
);

document.getElementById('grandparent').addEventListener(
  'click',
  () => console.log('Grandparent: BUBBLE phase'),
  false // useCapture = false (default)
);

document.getElementById('parent').addEventListener(
  'click',
  () => console.log('Parent: BUBBLE phase')
);

document.getElementById('child').addEventListener(
  'click',
  () => console.log('Child: TARGET phase')
);

// Clicking the button logs:
// "Grandparent: CAPTURE phase"
// "Child: TARGET phase"
// "Parent: BUBBLE phase"
// "Grandparent: BUBBLE phase"

// ============================================
// 2. event.target vs event.currentTarget
// ============================================
/*
  event.target: the element that TRIGGERED the event (clicked)
  event.currentTarget: the element the listener is ATTACHED to

  These are the same only when the listener is on the target itself.
*/
document.getElementById('parent').addEventListener('click', (e) => {
  console.log('target:', e.target.id);         // "child" (what was clicked)
  console.log('currentTarget:', e.currentTarget.id); // "parent" (where listener is)
});

// ============================================
// 3. Event Delegation Pattern
// ============================================
// Instead of attaching listeners to each child, attach ONE to the parent.
// Benefits:
// - Fewer event listeners = better memory usage
// - Dynamically added children are automatically handled
// - Simpler code for large lists

/*
  <ul id="todo-list">
    <li data-id="1">Task 1 <button class="delete">X</button></li>
    <li data-id="2">Task 2 <button class="delete">X</button></li>
    <li data-id="3">Task 3 <button class="delete">X</button></li>
  </ul>
*/

const todoList = document.getElementById('todo-list');

// ONE listener handles all items (including future ones)
todoList.addEventListener('click', (e) => {
  const target = e.target;

  // Handle delete button clicks
  if (target.matches('.delete')) {
    const li = target.closest('li');
    const taskId = li.dataset.id;
    console.log(`Deleting task ${taskId}`);
    li.remove();
    return;
  }

  // Handle clicking on a list item itself
  if (target.matches('li') || target.closest('li')) {
    const li = target.closest('li');
    li.classList.toggle('completed');
  }
});

// Dynamically added items work automatically!
function addTodo(text, id) {
  const li = document.createElement('li');
  li.dataset.id = id;
  li.innerHTML = `${text} <button class="delete">X</button>`;
  todoList.appendChild(li);
  // No need to attach new event listener!
}

// ============================================
// 4. Advanced Delegation: Tab Component
// ============================================
/*
  <div class="tabs" id="tab-container">
    <button class="tab" data-tab="home">Home</button>
    <button class="tab" data-tab="profile">Profile</button>
    <button class="tab" data-tab="settings">Settings</button>
  </div>
  <div class="tab-content" id="tab-content"></div>
*/

function initTabs(containerId, contentId) {
  const container = document.getElementById(containerId);
  const content = document.getElementById(contentId);

  container.addEventListener('click', (e) => {
    const tabButton = e.target.closest('.tab');
    if (!tabButton) return; // clicked outside a tab

    // Remove active class from all tabs
    container.querySelectorAll('.tab').forEach((tab) =>
      tab.classList.remove('active')
    );

    // Activate clicked tab
    tabButton.classList.add('active');

    // Update content
    const tabName = tabButton.dataset.tab;
    content.textContent = `Content for ${tabName}`;
  });
}

// ============================================
// 5. stopPropagation vs stopImmediatePropagation
// ============================================
const btn = document.getElementById('child');

btn.addEventListener('click', (e) => {
  console.log('Handler 1');
  // e.stopPropagation();
  // Stops event from bubbling UP, but other handlers on THIS element still run.

  // e.stopImmediatePropagation();
  // Stops bubbling AND prevents other handlers on THIS element from running.
});

btn.addEventListener('click', (e) => {
  console.log('Handler 2');
  // With stopPropagation():          runs
  // With stopImmediatePropagation(): does NOT run
});

// ============================================
// 6. Preventing Default Behavior
// ============================================
document.getElementById('my-form').addEventListener('submit', (e) => {
  e.preventDefault(); // prevent form submission / page reload
  const formData = new FormData(e.target);
  console.log('Form data:', Object.fromEntries(formData));
});
```
