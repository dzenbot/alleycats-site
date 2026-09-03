const faqList = document.querySelector("#faq-list");

function appendLinkifiedText(element, text) {
  const linkPattern =
    /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
  let cursor = 0;

  for (const match of text.matchAll(linkPattern)) {
    const matchIndex = match.index ?? 0;
    let linkText = match[0];
    let trailingPunctuation = "";

    while (/[.,!?;:)]$/.test(linkText)) {
      trailingPunctuation = linkText.slice(-1) + trailingPunctuation;
      linkText = linkText.slice(0, -1);
    }

    element.appendChild(
      document.createTextNode(text.slice(cursor, matchIndex)),
    );

    const link = document.createElement("a");
    const isEmail = linkText.includes("@") && !linkText.includes("://");
    link.href = isEmail
      ? `mailto:${linkText}`
      : linkText.startsWith("www.")
        ? `https://${linkText}`
        : linkText;
    link.textContent = linkText;

    if (!isEmail) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    element.appendChild(link);
    element.appendChild(document.createTextNode(trailingPunctuation));
    cursor = matchIndex + match[0].length;
  }

  element.appendChild(document.createTextNode(text.slice(cursor)));
}

fetch("guidelines.json")
  .then((response) => {
    if (!response.ok) throw new Error("FAQ data could not be loaded");
    return response.json();
  })
  .then((items) => {
    faqList.textContent = "";
    const openFirstItem = !window.matchMedia("(max-width: 767px)").matches;

    items.forEach((item, index) => {
      const initiallyOpen = index === 0 && openFirstItem;
      const article = document.createElement("article");
      article.className = `faq-item${initiallyOpen ? " is-open" : ""}`;

      const button = document.createElement("button");
      button.className = "faq-question";
      button.type = "button";
      button.id = `faq-question-${index}`;
      button.setAttribute("aria-expanded", String(initiallyOpen));
      button.setAttribute("aria-controls", `faq-answer-${index}`);

      const label = document.createElement("span");
      label.textContent = item.question;
      const chevron = document.createElement("span");
      chevron.className = "faq-chevron";
      chevron.setAttribute("aria-hidden", "true");
      button.append(label, chevron);

      const answer = document.createElement("div");
      answer.className = "faq-answer";
      answer.id = `faq-answer-${index}`;
      answer.setAttribute("role", "region");
      answer.setAttribute("aria-labelledby", button.id);

      const inner = document.createElement("div");
      inner.className = "faq-answer-inner";
      const content = document.createElement("div");
      content.className = "faq-answer-content";
      item.answer.forEach((text) => {
        const paragraph = document.createElement("p");
        appendLinkifiedText(paragraph, text);
        content.appendChild(paragraph);
      });
      inner.appendChild(content);
      answer.appendChild(inner);

      button.addEventListener("click", () => {
        const open = article.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(open));
      });

      article.append(button, answer);
      faqList.appendChild(article);
    });
  })
  .catch(() => {
    faqList.innerHTML =
      '<p class="faq-loading">Questions are temporarily unavailable. Please refresh the page.</p>';
  });
