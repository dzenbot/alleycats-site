const faqList = document.querySelector("#faq-list");

fetch("faq.json")
  .then((response) => {
    if (!response.ok) throw new Error("FAQ data could not be loaded");
    return response.json();
  })
  .then((items) => {
    faqList.textContent = "";
    items.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = `faq-item${index === 0 ? " is-open" : ""}`;

      const button = document.createElement("button");
      button.className = "faq-question";
      button.type = "button";
      button.id = `faq-question-${index}`;
      button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
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
        paragraph.textContent = text;
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
