(() => {
  const config = window.ALLEY_CATS_REVIEWS;
  const section = document.querySelector("[data-google-reviews]");

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

    const quote = document.createElement("blockquote");
    quote.textContent = `“${review.text}”`;

    const footer = document.createElement("figcaption");
    const author = document.createElement("a");
    const authorDetails = document.createElement("span");
    const authorName = document.createElement("strong");
    const reviewMeta = document.createElement("small");
    const attribution = review.authorAttribution;

    author.className = "google-review-author";
    author.href = attribution?.uri || review.googleMapsURI || config.reviewsUrl;
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

    if (review.googleMapsURI) {
      const source = document.createElement("a");
      source.className = "google-review-source";
      source.href = review.googleMapsURI;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = "View on Google Maps";
      footer.appendChild(source);
    }

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
      .filter((review) => review.text)
      .slice(0, 3);
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
