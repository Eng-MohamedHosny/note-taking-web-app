document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('title');
  const tagsInput = document.getElementById('tags');
  const contentInput = document.getElementById('content');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Pre-fill active tab title or selected text if available
  if (chrome?.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.title) {
        titleInput.value = `Clip: ${activeTab.title}`;
      }
      if (activeTab?.url) {
        contentInput.value = `Source: ${activeTab.url}\n\n`;
      }
    });
  }

  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim() || 'Untitled Note';
    const content = contentInput.value.trim();
    const tags = tagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newNote = {
      id: 'ext-' + Date.now(),
      title,
      content,
      tags: tags.length ? tags : ['WebClip'],
      lastEdited: new Date().toISOString(),
      isArchived: false,
    };

    if (chrome?.storage?.local) {
      chrome.storage.local.get(['notes_app_data_v1'], (result) => {
        const notes = result.notes_app_data_v1 || [];
        notes.unshift(newNote);
        chrome.storage.local.set({ notes_app_data_v1: notes }, () => {
          statusDiv.style.display = 'block';
          setTimeout(() => window.close(), 1000);
        });
      });
    } else {
      statusDiv.style.display = 'block';
      setTimeout(() => window.close(), 1000);
    }
  });
});
