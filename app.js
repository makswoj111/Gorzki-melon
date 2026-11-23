/* ==========================================================================
   GORZKI MELON — interakcje „Masala Festa”
   GSAP 3 + ScrollTrigger + SplitText, Lenis. Każda animacja ma powód:
   apetyt, orientację albo uśmiech. Przy prefers-reduced-motion zostają fade-iny.
   ========================================================================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const G = window.gsap;
  const hasGsap = !!(G && window.ScrollTrigger);
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  if (hasGsap) G.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []));

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis) — wyłączony przy ograniczonym ruchu
     ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduced && window.Lenis && hasGsap) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const headerOffset = () => ($(".top")?.offsetHeight || 0) + 40;
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id.length > 1 && $(id);
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: -headerOffset() });
    else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  }));

  /* ------------------------------------------------------------------
     Karta dań: zakładki Jedzenie / Napoje i desery, cała karta naraz
     w dwóch kolumnach, filtry wege / wegańskie / ostrość, miniatura przy kursorze
     ------------------------------------------------------------------ */
  const MENU = window.MENU || [];
  const catImg = { "przystawki-wege": "naan-samosa", "przystawki-mieso": "board", szef: "momo-chilli", zupy: "curry-rice", salatki: "grilled-salad", wege: "veg-curry", mieso: "curries", ryby: "curries", tandoor: "sizzler", chleb: "naan-curry", nepal: "thali-momo", tajskie: "padthai", biryani: "table-spread", ryz: "curry-rice", desery: "platter", napoje: "craft-beer" };
  const DRINKS = ["desery", "napoje"];
  const panel = $("#menuPanel");
  const st = { group: "food", v: false, vg: false, h: 0 };
  const icon = (id, cls) => '<svg class="i ' + cls + '" aria-hidden="true"><use href="#' + id + '"/></svg>';

  function dishHTML([n, p, d, o], cat) {
    const tags = "";
    return '<div class="dish" data-img="img/' + catImg[cat] + '-s.webp">' +
      '<p class="dish__row"><span class="dish__name">' + esc(n) +
      (tags ? '<span class="dish__tags" role="img" aria-label="' + label + '">' + tags + "</span>" : "") +
      '</span><span class="dish__lead" aria-hidden="true"></span><span class="dish__price">' + p + " zł</span></p>" +
      (d ? '<p class="dish__desc">' + esc(d) + "</p>" : "") + "</div>";
  }
  const pass = ([, , , o]) => (!st.v || o.v) && (!st.vg || o.vg) && (!st.h || o.h === st.h);

  function renderMenu() {
    const cats = MENU.filter((c) => (st.group === "drinks") === DRINKS.includes(c.id));
    const html = cats.map((c) => {
      const items = c.items.filter(pass);
      if (!items.length) return "";
      return '<div class="mcat"><h3 class="mcat__h">' + esc(c.name) + "</h3>" + items.map((it) => dishHTML(it, c.id)).join("") + "</div>";
    }).join("");
    panel.innerHTML = html || '<p class="menu__empty">Nic nie pasuje do wybranych filtrów. <button type="button" class="link" id="clearF">Wyczyść filtry</button></p>';
    $("#clearF")?.addEventListener("click", clearFilters);
    if (hasGsap && !reduced) G.from($$(".mcat", panel).slice(0, 6), { y: 18, opacity: 0, duration: .5, stagger: .05, ease: "power2.out" });
    bindFollow($(".follow--menu"), $$(".dish", panel));
    syncFold();
    if (hasGsap) ScrollTrigger.refresh();
  }

  /* Karta zwinięta domyślnie — „Rozwiń całą kartę” / „Zwiń kartę” */
  const wrap = $("#menuWrap"), more = $("#menuMore");
  let unfolded = false;
  const foldLimit = () => parseFloat(getComputedStyle(wrap).getPropertyValue("--collapsed")) || 760;
  function setMoreLabel() {
    const n = $$(".dish", panel).length;
    more.querySelector(".menu__more-txt").textContent = unfolded ? "Zwiń kartę" : `Rozwiń całą kartę (${n} ${n === 1 ? "pozycja" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "pozycje" : "pozycji"})`;
    more.setAttribute("aria-expanded", unfolded);
  }
  function syncFold() {
    if (!wrap || !more) return;
    const needed = panel.scrollHeight > foldLimit() + 120;
    more.hidden = !needed;
    wrap.classList.toggle("is-collapsed", needed && !unfolded);
    wrap.style.height = needed && !unfolded ? foldLimit() + "px" : "auto";
    setMoreLabel();
  }
  function toggleFold() {
    const from = wrap.getBoundingClientRect().height;
    unfolded = !unfolded;
    const to = unfolded ? panel.scrollHeight : foldLimit();
    wrap.classList.toggle("is-collapsed", !unfolded);
    setMoreLabel();
    if (reduced) { wrap.style.height = unfolded ? "auto" : to + "px"; }
    else {
      wrap.style.height = from + "px";
      requestAnimationFrame(() => { wrap.style.height = to + "px"; });
      wrap.addEventListener("transitionend", function done(e) {
        if (e.propertyName !== "height") return;
        wrap.removeEventListener("transitionend", done);
        if (unfolded) wrap.style.height = "auto";
        if (hasGsap) ScrollTrigger.refresh();
      });
    }
    // po zwinięciu wróć na początek karty, żeby nie zostać w pustym miejscu
    if (!unfolded) {
      const target = $(".menu__switch");
      if (lenis) lenis.scrollTo(target, { offset: -headerOffset() });
      else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }
  }
  more?.addEventListener("click", toggleFold);
  addEventListener("resize", () => { if (!unfolded) syncFold(); });

  function selectGroup(g, focus) {
    st.group = g;
    $$(".menu__tab").forEach((b) => {
      const on = b.dataset.group === g;
      b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
      if (on) { panel.setAttribute("aria-labelledby", b.id); if (focus) b.focus(); }
    });
    renderMenu();
  }
  function clearFilters() {
    st.v = st.vg = false; st.h = 0;
    $$(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    renderMenu();
  }
  if (panel) {
    $$(".menu__tab").forEach((b, i, arr) => {
      b.addEventListener("click", () => selectGroup(b.dataset.group));
      b.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { e.preventDefault(); selectGroup(arr[(i + d + arr.length) % arr.length].dataset.group, true); }
      });
    });
    selectGroup("food");
  }

  /* ------------------------------------------------------------------
     Zdjęcie podążające za kursorem (trzy kuchnie, karta dań)
     ------------------------------------------------------------------ */
  function bindFollow(box, items) {
    if (!box || touch || reduced || !hasGsap) return;
    const img = box.querySelector("img");
    if (!box._q) {
      box._q = { x: G.quickTo(box, "x", { duration: .5, ease: "power3" }), y: G.quickTo(box, "y", { duration: .5, ease: "power3" }) };
      G.set(box, { xPercent: -50, yPercent: -60, scale: .94, rotate: -4 });
    }
    items.forEach((it) => {
      it.addEventListener("mouseenter", (e) => {
        if (img.getAttribute("src") !== it.dataset.img) img.src = it.dataset.img;
        G.set(box, { x: e.clientX + 30, y: e.clientY });
        G.to(box, { opacity: 1, scale: 1, rotate: G.utils.random(-4, 4), duration: .2, ease: "power3.out", overwrite: "auto" });
      });
      it.addEventListener("mousemove", (e) => { box._q.x(e.clientX + 30); box._q.y(e.clientY); });
      it.addEventListener("mouseleave", () => G.to(box, { opacity: 0, scale: .94, duration: .15, ease: "power2.out", overwrite: "auto" }));
    });
  }


  /* ------------------------------------------------------------------
     Kursor: zielony punkt, „SMACZNEGO” nad zdjęciami, „ZAMÓW” nad CTA
     ------------------------------------------------------------------ */
  const cur = $(".cursor");
  if (cur && !touch && hasGsap) {
    document.body.classList.add("has-cursor");
    const qx = G.quickTo(cur, "x", { duration: .25, ease: "power3" }), qy = G.quickTo(cur, "y", { duration: .25, ease: "power3" });
    addEventListener("pointermove", (e) => { qx(e.clientX); qy(e.clientY); }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => cur.classList.add("is-hidden"));
    document.documentElement.addEventListener("mouseenter", () => cur.classList.remove("is-hidden"));
    const lbl = $(".cursor__label");
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      cur.classList.toggle("is-label", !!t);
      cur.classList.toggle("is-cta", !!t && /ZAMÓW|ZADZWOŃ|TRASA/.test(t.dataset.cursor));
      if (t) lbl.textContent = t.dataset.cursor;
    });
  }

  /* ------------------------------------------------------------------
     Przyciski: tło „wylewa się” od miejsca, w którym wjechał kursor
     ------------------------------------------------------------------ */
  $$(".btn").forEach((b) => {
    const set = (e) => { const r = b.getBoundingClientRect(); b.style.setProperty("--x", `${e.clientX - r.left}px`); b.style.setProperty("--y", `${e.clientY - r.top}px`); };
    b.addEventListener("pointerenter", set);
    b.addEventListener("pointerleave", set);
  });

  /* ------------------------------------------------------------------
     Pieczątka MENU: napis krąży po owalu
     ------------------------------------------------------------------ */
  const tp = $(".stamp textPath"), sp = $("#stampPath");
  if (tp && sp) {
    const L = sp.getTotalLength();
    tp.textContent = "• MENU • KARTA • MENU • KARTA • MENU • KARTA • MENU • KARTA ";
    tp.setAttribute("textLength", (L * 2).toFixed(1));
    tp.setAttribute("lengthAdjust", "spacing");
    if (hasGsap && !reduced) G.fromTo(tp, { attr: { startOffset: 0 } }, { attr: { startOffset: -L }, duration: 16, ease: "none", repeat: -1 });
  }

  /* ------------------------------------------------------------------
     Marquee: tempo zależy od scrolla, kierunek odwraca się przy scrollu w górę
     ------------------------------------------------------------------ */
  const marquees = $$(".marquee__track").map((tr) => {
    tr.innerHTML += tr.innerHTML; // duplikat dla pętli bez szwu
    return { tr, x: 0, half: 0 };
  });
  if (hasGsap && !reduced) {
    let dir = 1, boost = 0, lastY = scrollY;
    const measure = () => marquees.forEach((m) => { m.half = m.tr.scrollWidth / 2; });
    measure(); addEventListener("resize", measure); document.fonts?.ready.then(measure);
    G.ticker.add(() => {
      const y = lenis ? lenis.scroll : scrollY;
      const v = lenis ? lenis.velocity : y - lastY;
      lastY = y;
      if (v > 0.2) dir = 1; else if (v < -0.2) dir = -1;
      boost += (Math.min(Math.abs(v), 60) * 0.25 - boost) * 0.1;
      marquees.forEach((m, i) => {
        if (!m.half) return;
        m.x -= (0.6 + boost) * dir * (i % 2 ? -1 : 1);
        m.x = G.utils.wrap(-m.half, 0, m.x);
        m.tr.style.transform = `translate3d(${m.x}px,0,0)`;
      });
    });
  }

  /* Rezerwacja stolika: wybór kliknięciem, walidacja i gotowa wiadomość e-mail (brak systemu online) */
  const book = $("#bookForm");
  if (book) {
    const msg = $(".rsv__msg", book), dateIn = book.elements.date, dateWrap = $(".rsv__date", book);
    const pad = (n) => String(n).padStart(2, "0");
    const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const now = new Date(), tomorrow = new Date(now.getTime() + 864e5);
    dateIn.min = iso(now);
    const setWhen = (v) => {
      dateWrap.hidden = v !== "pick";
      if (v === "today") dateIn.value = iso(now);
      if (v === "tomorrow") dateIn.value = iso(tomorrow);
      if (v === "pick") { if (!dateIn.value || dateIn.value < dateIn.min) dateIn.value = iso(tomorrow); dateIn.focus(); }
    };
    // po 21:00 dziś już nie zarezerwujemy, więc domyślnie jutro
    if (now.getHours() >= 21) { book.elements.when.value = "tomorrow"; }
    setWhen(book.elements.when.value);
    $$('input[name="when"]', book).forEach((r) => r.addEventListener("change", () => setWhen(r.value)));
    $$(".rsv__q", book).forEach((q) => q.addEventListener("change", () => q.removeAttribute("data-invalid")));
    book.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      ["people", "time"].forEach((n) => {
        const q = $(`input[name="${n}"]`, book).closest(".rsv__q");
        if (!book.elements[n].value) { q.setAttribute("data-invalid", ""); ok = false; }
      });
      const badDate = !dateIn.value || dateIn.value < dateIn.min;
      dateIn.setAttribute("aria-invalid", String(badDate));
      if (badDate) { dateWrap.closest(".rsv__q").setAttribute("data-invalid", ""); ok = false; }
      ["name", "phone"].forEach((n) => {
        const el = book.elements[n];
        const bad = !el.value.trim() || (n === "phone" && el.value.replace(/\D/g, "").length < 9);
        el.setAttribute("aria-invalid", String(bad));
        if (bad) ok = false;
      });
      if (!ok) { msg.textContent = "Uzupełnij zaznaczone pola, proszę."; msg.className = "rsv__msg is-err"; return; }
      const v = Object.fromEntries(new FormData(book));
      const body = `Dzień dobry,\n\nproszę o rezerwację stolika.\n\nData: ${v.date}\nGodzina: ${v.time}\nLiczba osób: ${v.people}\nImię: ${v.name}\nTelefon: ${v.phone}\nUwagi: ${v.notes || "-"}\n`;
      location.href = `mailto:info@gorzkimelon.waw.pl?subject=${encodeURIComponent(`Rezerwacja ${v.date} ${v.time}, ${v.people} os.`)}&body=${encodeURIComponent(body)}`;
      msg.textContent = `Dziękujemy, ${v.name}. Otworzyliśmy wiadomość z rezerwacją — wyślij ją, a oddzwonimy z potwierdzeniem.`;
      msg.className = "rsv__msg is-ok";
    });
  }

  /* Hasło: każde słowo osobno zmienia kolor, w kolejności czytania, gdy przekracza linię */
  const tagline = $("[data-words]");
  if (tagline) {
    tagline.innerHTML = tagline.innerHTML.split(/(\s+|&nbsp;)/).map((w) => (/^(\s+|&nbsp;)$/.test(w) || !w ? w : '<span class="tw">' + w + "</span>")).join("");
    const words = $$(".tw", tagline);
    if (reduced || !hasGsap) words.forEach((w) => w.classList.add("is-on"));
    else ScrollTrigger.create({ trigger: tagline, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: (self) => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle("is-on", i < n)); } });
  }

  /* FAQ: płynne rozwijanie odpowiedzi */
  $$(".faq__item").forEach((d) => {
    const a = $(".faq__a", d);
    $("summary", d).addEventListener("click", (e) => {
      if (reduced || !hasGsap) return;
      e.preventDefault();
      if (d.open) { G.to(a, { height: 0, duration: .5, ease: "power3.inOut", onComplete: () => { d.open = false; G.set(a, { clearProps: "height" }); ScrollTrigger.refresh(); } }); }
      else { d.open = true; G.fromTo(a, { height: 0 }, { height: a.scrollHeight, duration: .6, ease: "power3.out", onComplete: () => { G.set(a, { clearProps: "height" }); ScrollTrigger.refresh(); } }); }
    });
  });

  /* Opinie: duplikat kart, żeby pas przewijał się bez końca */
  const rvTrack = $(".rv-track");
  if (rvTrack) [...rvTrack.children].forEach((n) => { const k = n.cloneNode(true); k.setAttribute("aria-hidden", "true"); rvTrack.appendChild(k); });

  /* ------------------------------------------------------------------
     Hero: „ślad masali” — zdjęcia dań za kursorem
     ------------------------------------------------------------------ */
  const trail = $(".hero__trail"), hero = $(".hero");
  const shots = [
    ["momo-chilli", "4/5"], ["padthai", "4/5"], ["thali-trays", "2/3"], ["naan-curry", "4/5"], ["board", "4/5"], ["table-spread", "3/2"],
    ["sizzler", "2/3"], ["naan-samosa", "4/5"], ["curries", "4/5"], ["thali-momo", "2/3"], ["veg-curry", "2/3"], ["platter", "3/2"],
  ];
  let shotIdx = 0;
  function dropShot(x, y) {
    const [n, ar] = shots[shotIdx++ % shots.length];
    const el = document.createElement("figure");
    el.className = "trail-img";
    const w = ar === "3/2" ? G.utils.random(230, 280) : G.utils.random(170, 220);
    el.style.setProperty("--w", `${w}px`);
    el.style.setProperty("--ar", ar);
    el.innerHTML = `<img src="img/${n}-s.webp" alt="">`;
    trail.appendChild(el);
    G.set(el, { x, y, xPercent: -50, yPercent: -50, rotate: G.utils.random(-12, 12), scale: .6, opacity: 0 });
    G.timeline({ onComplete: () => el.remove() })
      .to(el, { scale: 1, opacity: 1, duration: .45, ease: "back.out(1.8)" })
      .to(el, { scale: .92, opacity: 0, y: y + 24, duration: .35, ease: "power2.out" }, 1);
    while (trail.children.length > 12) trail.firstElementChild.remove();
  }
  if (trail && hero && hasGsap && !reduced) {
    // wstępne ładowanie miniatur dopiero po starcie strony (nie blokuje LCP)
    addEventListener("load", () => shots.forEach(([n]) => { const i = new Image(); i.src = `img/${n}-s.webp`; }));
    if (!touch) {
      let lx = null, ly = null;
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (lx === null) { lx = x; ly = y; return; }
        if (Math.hypot(x - lx, y - ly) > 90) { dropShot(x, y); lx = x; ly = y; }
      });
    } else {
      let timer = null;
      const scatter = () => { const r = hero.getBoundingClientRect(); dropShot(G.utils.random(r.width * .15, r.width * .85), G.utils.random(r.height * .12, r.height * .78)); };
      new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting) timer = setInterval(scatter, 700);
      }, { threshold: .3 }).observe(hero);
    }
  }

  /* ------------------------------------------------------------------
     Animacje przy scrollu
     ------------------------------------------------------------------ */
  function scrollAnims() {
    if (!hasGsap || reduced) {
      // fallback: same fade-iny
      const els = $$(".polaroid, .note, .rsv__photo, .visit__info");
      els.forEach((el) => el.classList.add("fade"));
      const io = "IntersectionObserver" in window && new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px" });
      els.forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
      return;
    }

    // Nagłówki: linia po linii; słowo-akcent dostaje błękit z opóźnieniem
    $$("[data-split]").forEach((h) => {
      const dark = !!h.closest(".menu__tandoor");
      let lines = [h];
      if (window.SplitText) lines = SplitText.create(h, { type: "lines", mask: "lines", linesClass: "split-line-inner" }).lines;
      const ems = $$("em", h);
      const tl = G.timeline({ scrollTrigger: { trigger: h, start: "top 86%" } });
      tl.from(lines, { yPercent: 110, duration: 1, ease: "expo.out", stagger: .08 });
      if (ems.length) {
        if (dark) tl.to(ems, { color: "#C9D9F2", duration: .6 }, "-=.4");
        else {
          // na jasnym tle błękitne „pociągnięcie pędzla” pod słowem — tekst zostaje czytelny (WCAG AA)
          G.set(ems, { backgroundImage: "linear-gradient(transparent 60%, rgba(201,217,242,.95) 60%, rgba(201,217,242,.95) 90%, transparent 90%)", backgroundRepeat: "no-repeat", backgroundSize: "0% 100%" });
          tl.to(ems, { backgroundSize: "100% 100%", duration: .8, ease: "power2.out" }, "-=.45");
        }
      }
    });

    // Parallax naklejek i polaroidów
    $$("[data-speed]").forEach((el) => {
      G.to(el, { yPercent: -parseFloat(el.dataset.speed) * 160, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Wejścia elementów
    G.utils.toArray(".polaroid:not([data-speed]), .rsv__photo, .visit__garden").forEach((el) => {
      G.from(el, { y: 50, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } });
    });

    // Jeden stół: zdjęcie lekko „osiada” przy scrollu; na telefonie przesuwa się w bok, żeby pokazać cały stół
    const canvas = $(".stol__canvas");
    if (canvas) {
      const narrow = matchMedia("(max-width: 640px)").matches;
      if (narrow) {
        const span = () => Math.max(0, (canvas.offsetWidth - innerWidth) / 2 - 8);
        G.fromTo(canvas, { x: () => span() * .9 }, { x: () => -span(), ease: "none", invalidateOnRefresh: true, scrollTrigger: { trigger: ".stol", start: "top 70%", end: "bottom 30%", scrub: true } });
      } else {
        G.fromTo(canvas, { scale: 1.1 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".stol", start: "top bottom", end: "center center", scrub: true } });
      }
      // kropki: GSAP nie może dotykać transformu .spot (CSS translate pozycjonuje etykietę), więc skalujemy tylko kropkę
      const spotTl = G.timeline({ scrollTrigger: { trigger: ".stol", start: narrow ? "top 60%" : "top 35%" } });
      $$(".spot", canvas).forEach((sp, i) => spotTl
        .from(sp, { opacity: 0, duration: .3, ease: "power2.out" }, i * .09)
        .from($(".spot__dot", sp), { scale: .9, duration: .35, ease: "power3.out" }, i * .09));
      G.from(".stol__note", { y: 20, opacity: 0, duration: .7, ease: "power3.out", scrollTrigger: { trigger: ".stol", start: "top 20%" } });
    }

    // Żar w tandoorze narasta przy scrollu
    G.fromTo(".tandoor__glow", { scale: .6, opacity: .25 }, { scale: 1.15, opacity: 1, ease: "none", scrollTrigger: { trigger: ".menu__tandoor", start: "top bottom", end: "bottom top", scrub: true } });

    // Ocena liczy się od 0
    const sc = $(".score__num");
    if (sc) {
      const o = { v: 0 };
      sc.textContent = "0,0";
      G.to(o, { v: parseFloat(sc.dataset.count), duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: sc, start: "top 85%" }, onUpdate: () => { sc.textContent = o.v.toFixed(1).replace(".", ","); } });
    }
  }

  /* ------------------------------------------------------------------
     Intro hero (po preloaderze)
     ------------------------------------------------------------------ */
  function heroIntro() {
    if (!hasGsap || reduced) return;
    G.from(".hero__w", { yPercent: 105, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .1 });
    G.from(".hero__hello, .hero__sub, .hero__lands li", { y: 20, opacity: 0, duration: .8, delay: .35, stagger: .08 });
    G.from(".top > *", { y: -30, opacity: 0, duration: .7, stagger: .08, ease: "power3.out" });
  }

  /* ------------------------------------------------------------------
     Preloader: melon się rysuje, licznik „skala ostrości”, krojenie na plastry (≤ 2 s)
     ------------------------------------------------------------------ */
  const loader = $(".loader");
  function finishLoad() {
    loader?.remove();
    document.body.classList.remove("is-loading");
    lenis?.start();
    heroIntro();
    if (hasGsap) ScrollTrigger.refresh();
  }
  async function start() {
    try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]); } catch (e) {}
    scrollAnims();
    if (!loader || reduced || !hasGsap || store.get("gm-seen")) { finishLoad(); return; }
    store.set("gm-seen", "1");
    lenis?.stop();
    const num = $(".loader__num"), c = { v: 0 };
    G.timeline({ onComplete: finishLoad })
      .to(".loader__path", { strokeDashoffset: 0, duration: 1, ease: "power2.inOut", stagger: .15 }, 0)
      .to(c, { v: 100, duration: 1.3, ease: "power1.inOut", onUpdate: () => { num.textContent = String(Math.round(c.v)).padStart(3, "0"); } }, 0)
      .to(".loader__cuts line", { strokeDashoffset: 0, duration: .25, stagger: .05, ease: "power2.in" }, 1.1)
      .to(".loader__inner", { opacity: 0, scale: .96, duration: .2 }, 1.45)
      .to(".loader__slices i", { yPercent: (i) => (i % 2 ? 101 : -101), duration: .6, ease: "expo.inOut", stagger: .04 }, 1.45);
  }

  /* ------------------------------------------------------------------
     Przejścia między podstronami: kurtyna w kolorze kurkumy z wzorem block print
     ------------------------------------------------------------------ */
  const curtain = $(".curtain");
  if (curtain && hasGsap && !reduced) {
    if (store.get("gm-curtain")) {
      store.set("gm-curtain", "");
      G.fromTo(curtain, { yPercent: 0, y: 0 }, { yPercent: -100, duration: .8, ease: "expo.inOut", delay: .05 });
    }
    $$("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || /^(tel|mailto):/.test(href)) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        store.set("gm-curtain", "1");
        G.fromTo(curtain, { yPercent: 100, y: 0 }, { yPercent: 0, duration: .8, ease: "expo.inOut", onComplete: () => { location.href = url.href; } });
      });
    });
  }

  // GSAP ładowany z defer — app.js też ma defer, więc wszystko jest już dostępne
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
