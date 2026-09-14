(() => {
  const config = window.ALLEY_CATS_REVIEWS;
  const section = document.querySelector("[data-google-reviews]");

  const animateReviewTitle = () => {
    const title = section?.querySelector("h2");
    const canAnimate = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!title || !canAnimate) return;

    const label = title.textContent.trim();
    const fragment = document.createDocumentFragment();
    let letterIndex = 0;

    label.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        return;
      }

      const word = document.createElement("span");
      word.className = "review-title-word";
      word.setAttribute("aria-hidden", "true");

      [...part].forEach((character) => {
        const letter = document.createElement("span");
        letter.className = "review-title-letter";
        letter.style.setProperty("--letter-index", letterIndex);
        letter.textContent = character;
        word.appendChild(letter);
        letterIndex += 1;
      });

      fragment.appendChild(word);
    });

    title.setAttribute("aria-label", label);
    title.replaceChildren(fragment);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        title.classList.add("is-waving");
        observer.disconnect();
      },
      { threshold: 0.55 },
    );
    observer.observe(title);
  };

  animateReviewTitle();

  if (
    !section ||
    !config?.apiKey ||
    config.apiKey === "ADD_RESTRICTED_GOOGLE_MAPS_API_KEY"
  ) {
    return;
  }

  const grid = section.querySelector("[data-review-grid]");
  const summary = section.querySelector("[data-review-summary]");
  const attribution = section.querySelector("[data-review-attribution]");

  const makeCardInteractive = (card, url) => {
    if (!url || card.dataset.reviewUrl) return;

    card.dataset.reviewUrl = url;
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", "Read the full review on Google Maps");

    const openReview = () => {
      window.open(url, "_blank", "noopener,noreferrer");
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      openReview();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openReview();
    });
  };

  section.querySelectorAll(".google-review").forEach((card) => {
    makeCardInteractive(
      card,
      card.querySelector(".google-review-author")?.href || config.reviewsUrl,
    );
  });

  const loadGoogleMaps = () =>
    new Promise((resolve, reject) => {
      if (window.google?.maps?.importLibrary) {
        resolve();
        return;
      }

      const callbackName = "initAlleyCatsGoogleReviews";
      window[callbackName] = () => {
        delete window[callbackName];
        resolve();
      };

      const script = document.createElement("script");
      const parameters = new URLSearchParams({
        key: config.apiKey,
        v: "weekly",
        libraries: "places",
        loading: "async",
        callback: callbackName,
      });

      script.src = `https://maps.googleapis.com/maps/api/js?${parameters}`;
      script.async = true;
      script.onerror = () => {
        delete window[callbackName];
        reject(new Error("Google Maps could not be loaded."));
      };
      document.head.appendChild(script);
    });

  const createStars = (rating = 5, extraClass = "") => {
    const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));
    const element = document.createElement("span");
    element.className = `google-rating-stars ${extraClass}`.trim();
    element.style.setProperty(
      "--rating-percent",
      `${Math.round((normalizedRating / 5) * 10000) / 100}%`,
    );
    element.setAttribute("aria-label", `${normalizedRating} out of 5 stars`);
    return element;
  };

  const createReview = (review) => {
    const card = document.createElement("figure");
    card.className = "google-review";
    makeCardInteractive(card, review.googleMapsURI || config.reviewsUrl);

    const quote = document.createElement("blockquote");
    quote.textContent = `“${review.text}”`;

    const footer = document.createElement("figcaption");
    const author = document.createElement("a");
    const authorDetails = document.createElement("span");
    const authorName = document.createElement("strong");
    const reviewMeta = document.createElement("small");
    const attribution = review.authorAttribution;

    author.className = "google-review-author";
    author.href = review.googleMapsURI || config.reviewsUrl;
    author.target = "_blank";
    author.rel = "noopener noreferrer";

    if (attribution?.photoURI) {
      const avatar = document.createElement("img");
      avatar.src = attribution.photoURI;
      avatar.alt = "";
      avatar.referrerPolicy = "no-referrer";
      author.appendChild(avatar);
    }

    authorName.textContent = attribution?.displayName || "Google reviewer";
    reviewMeta.append(
      createStars(review.rating, "google-review-stars"),
      document.createTextNode(
        review.relativePublishTimeDescription
          ? ` · ${review.relativePublishTimeDescription}`
          : "",
      ),
    );
    authorDetails.append(authorName, reviewMeta);
    author.appendChild(authorDetails);
    footer.appendChild(author);

    card.append(quote, footer);
    return card;
  };

  const showReviews = async () => {
    await loadGoogleMaps();
    const { Place } = await google.maps.importLibrary("places");
    const place = new Place({ id: config.placeId });

    await place.fetchFields({
      fields: ["displayName", "rating", "userRatingCount", "reviews"],
    });

    const reviews = (place.reviews || [])
      .filter((review) => review.text && Number(review.rating) >= 4)
      .map((review, originalIndex) => ({ review, originalIndex }))
      .sort(
        (first, second) =>
          Number(second.review.rating === 5) -
            Number(first.review.rating === 5) ||
          first.originalIndex - second.originalIndex,
      )
      .slice(0, 5)
      .map(({ review }) => review);
    if (!reviews.length) return;

    const cards = reviews.map(createReview);
    grid.replaceChildren(...cards);
    section.classList.add("has-live-reviews");

    if (place.rating) {
      const count = place.userRatingCount
        ? ` from ${place.userRatingCount.toLocaleString()} reviews`
        : "";
      const summaryText = document.createElement("span");
      summaryText.textContent = `${place.rating.toFixed(1)} on Google${count}`;
      summary.replaceChildren(
        createStars(place.rating, "google-summary-stars"),
        summaryText,
      );
      summary.hidden = false;
    }

    attribution.hidden = false;
  };

  showReviews().catch((error) => {
    console.warn(
      "Live Google reviews were unavailable; showing fallback reviews.",
      error,
    );
  });
})();
