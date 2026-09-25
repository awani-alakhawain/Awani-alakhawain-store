// =====================================================
// أواني الأخوين - APP.JS
// نسخة: المنتجات + التفاصيل + السلة + WhatsApp
// =====================================================

// =====================================================
// المنتجات التجريبية
// =====================================================

const starter = [
  {
    id: "starter1",
    name: "إبريق أنوكس",
    price: 100,
    oldPrice: 0,
    offer: false,
    cat: "أباريق",
    emoji: "🫖",
    desc: "إبريق أنوكس بجودة جيدة.",
    image: ""
  },
  {
    id: "starter2",
    name: "طقم أواني الطبخ",
    price: 249,
    oldPrice: 0,
    offer: false,
    cat: "أواني الطبخ",
    emoji: "🍳",
    desc: "طقم عملي للمطبخ.",
    image: ""
  },
  {
    id: "starter3",
    name: "كاسرولة أنوكس",
    price: 120,
    oldPrice: 0,
    offer: false,
    cat: "أواني الطبخ",
    emoji: "🥘",
    desc: "كاسرولة أنوكس للاستعمال اليومي.",
    image: ""
  },
  {
    id: "starter4",
    name: "صينية تقديم",
    price: 80,
    oldPrice: 0,
    offer: false,
    cat: "أواني منزلية",
    emoji: "🍽️",
    desc: "صينية أنيقة للتقديم.",
    image: ""
  }
];


// =====================================================
// المتغيرات
// =====================================================

let products = [];

let cart = {};

try {
  const savedCart = localStorage.getItem("cart");

  if (savedCart) {
    const parsed = JSON.parse(savedCart);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      cart = parsed;
    }
  }
} catch (error) {
  console.warn("تعذر تحميل السلة القديمة:", error);
  cart = {};
}

const $ = (selector) =>
  document.querySelector(selector);


// =====================================================
// بانر العروض
// =====================================================

let offerIndex = 0;
let offerTimer = null;

function renderFeaturedAd() {

  const ad = document.getElementById("featured-ad");

  if (!ad) return;

  const offers = products.filter((p) => {

    return (
      Number(p.oldPrice || 0) >
      Number(p.price || 0)
    );

  });

  if (offers.length === 0) {

    ad.innerHTML = "";
    ad.style.display = "none";

    if (offerTimer) {
      clearInterval(offerTimer);
      offerTimer = null;
    }

    return;
  }

  ad.style.display = "block";

  if (offerIndex >= offers.length) {
    offerIndex = 0;
  }

  function showOffer(index) {

    const p = offers[index];

    if (!p) return;

    const image = p.image
      ? `
        <img
          src="${p.image}"
          alt="${p.name}"
          onerror="
            this.style.display='none';
            if(this.nextElementSibling){
              this.nextElementSibling.style.display='flex';
            }
          "
        >
        <div
          class="offer-emoji"
          style="display:none;"
        >
          ${p.emoji || "🛍️"}
        </div>
      `
      : `
        <div class="offer-emoji">
          ${p.emoji || "🛍️"}
        </div>
      `;

    ad.innerHTML = `
      <div class="offer-slide">

        ${image}

        <div class="offer-info">

          <div class="offer-title">
            🔥 ${p.name}
          </div>

          <div class="offer-prices">

            <span class="old-price">
              ${p.oldPrice} درهم
            </span>

            <span class="new-price">
              ${p.price} درهم
            </span>

          </div>

          <div class="offer-label">
            🔥 عرض محدود
          </div>

        </div>

      </div>
    `;

    const slide = ad.querySelector(".offer-slide");

    if (slide) {

      slide.onclick = () => {
        openProduct(p.id);
      };

      slide.style.cursor = "pointer";

    }
  }

  showOffer(offerIndex);

  if (offerTimer) {
    clearInterval(offerTimer);
  }

  offerTimer = setInterval(() => {

    const currentOffers = products.filter((p) => {

      return (
        Number(p.oldPrice || 0) >
        Number(p.price || 0)
      );

    });

    if (currentOffers.length === 0) {

      clearInterval(offerTimer);
      offerTimer = null;

      ad.style.display = "none";

      return;
    }

    offerIndex++;

    if (offerIndex >= currentOffers.length) {
      offerIndex = 0;
    }

    showOffer(offerIndex);

  }, 4000);
}


// =====================================================
// تحميل المنتجات من Firebase
// =====================================================

async function loadProducts() {

  try {

    console.log("🔄 جاري تحميل المنتجات...");

    const snapshot =
      await db.collection("products").get();

    products = [];

    snapshot.forEach((doc) => {

      const data = doc.data();

      products.push({

        id: doc.id,

        name:
          data.name || "",

        price:
          Number(data.price || 0),

        oldPrice:
          Number(data.oldPrice || 0),

        offer:
          data.offer === true,

        cat:
          data.cat || "أخرى",

        emoji:
          data.emoji || "🛍️",

        desc:
          data.desc || "",

        image:
          data.image || ""

      });

    });

    console.log(
      "✅ عدد المنتجات:",
      products.length
    );

    if (products.length === 0) {
      products = [...starter];
    }

    render();

    renderFeaturedAd();

    if (typeof renderCategories === "function") {
      renderCategories();
    }

    if (
      typeof auth !== "undefined" &&
      auth &&
      auth.currentUser
    ) {

      if (typeof renderAdmin === "function") {
        renderAdmin();
      }

      if (typeof loadCategories === "function") {
        loadCategories();
      }

    }

  } catch (error) {

    console.error(
      "❌ Firebase products error:",
      error
    );

    if (products.length === 0) {
      products = [...starter];
    }

    render();

    renderFeaturedAd();

    if (typeof renderCategories === "function") {
      renderCategories();
    }

    alert(
      "وقع مشكل في تحميل المنتجات من Firebase."
    );
  }
}


// =====================================================
// عرض المنتجات
// =====================================================

function render() {

  const productsContainer = $("#products");

  if (!productsContainer) {
    console.warn("#products غير موجود.");
    return;
  }

  const searchInput = $("#search");
  const catSelect = $("#cat");

  const q =
    searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

  const c =
    catSelect
      ? catSelect.value
      : "";


  // ===================================================
  // الفئات
  // ===================================================

  const cats = [
    ...new Set(
      products
        .map((p) => p.cat)
        .filter(Boolean)
    )
  ];

  if (catSelect) {

    catSelect.innerHTML = `
      <option value="">
        كل الفئات
      </option>
    `;

    cats.forEach((cat) => {

      const option =
        document.createElement("option");

      option.value = cat;
      option.textContent = cat;

      if (cat === c) {
        option.selected = true;
      }

      catSelect.appendChild(option);

    });
  }


  // ===================================================
  // البحث
  // ===================================================

  const filtered = products.filter((p) => {

    const searchOK =
      !q ||
      String(p.name || "")
        .toLowerCase()
        .includes(q);

    const catOK =
      !c ||
      p.cat === c;

    return searchOK && catOK;

  });


  // ===================================================
  // لا توجد منتجات
  // ===================================================

  if (filtered.length === 0) {

    productsContainer.innerHTML = `
      <p
        style="
          text-align:center;
          padding:30px;
        "
      >
        لا توجد منتجات.
      </p>
    `;

    renderCart();

    return;
  }


  // ===================================================
  // المنتجات
  // ===================================================

  productsContainer.innerHTML =
    filtered.map((p) => {

      let picture = "";

      if (p.image) {

        picture = `
          <div
            class="product-picture"
            style="
              width:100%;
              height:220px;
              overflow:hidden;
              border-radius:12px;
              background:#f5f5f5;
            "
          >

            <img
              src="${p.image}"
              alt="${p.name}"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                display:block;
              "
              onerror="
                this.style.display='none';
                this.parentElement
                  .querySelector('.image-fallback')
                  .style.display='flex';
              "
            >

            <div
              class="image-fallback"
              style="
                display:none;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                font-size:60px;
              "
            >
              ${p.emoji || "🛍️"}
            </div>

          </div>
        `;

      } else {

        picture = `
          <div
            class="product-picture"
            style="
              width:100%;
              height:220px;
              border-radius:12px;
              background:#f5f5f5;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:60px;
            "
          >
            ${p.emoji || "🛍️"}
          </div>
        `;
      }


      // =================================================
      // السعر
      // =================================================

      let offerHTML = "";

      if (
        Number(p.oldPrice || 0) >
        Number(p.price || 0)
      ) {

        offerHTML = `
          <div style="margin-top:5px;">

            <span
              style="
                text-decoration:line-through;
                color:#777;
                margin-right:8px;
              "
            >
              ${p.oldPrice} درهم
            </span>

            <span
              style="
                color:#dc2626;
                font-weight:800;
              "
            >
              ${p.price} درهم
            </span>

          </div>
        `;

      } else {

        offerHTML = `
          <div class="price">
            ${p.price} درهم
          </div>
        `;
      }


      // =================================================
      // بطاقة المنتج
      // =================================================

      return `
        <article
          class="card"
          data-product-id="${p.id}"
          style="cursor:pointer;"
        >

          ${picture}

          <div class="body">

            <h3>
              ${p.name}
            </h3>

            <small>
              ${p.cat}
            </small>

            ${
              p.desc
                ? `
                  <p>
                    ${p.desc}
                  </p>
                `
                : ""
            }

            ${offerHTML}


            <button
              class="add"
              type="button"
              data-add-id="${p.id}"
            >
              🛒 أضف للسلة
            </button>


            <button
              type="button"
              data-order-id="${p.id}"
              style="
                margin-top:8px;
                width:100%;
              "
            >
              🟢 أطلب الآن عبر واتساب
            </button>

          </div>

        </article>
      `;

    }).join("");


  // ===================================================
  // الضغط على المنتج
  // ===================================================

  productsContainer
    .querySelectorAll(".card")
    .forEach((card) => {

      card.addEventListener("click", (event) => {

        if (
          event.target.closest("button")
        ) {
          return;
        }

        const id =
          card.getAttribute(
            "data-product-id"
          );

        openProduct(id);

      });

    });


  // ===================================================
  // زر إضافة للسلة
  // ===================================================

  productsContainer
    .querySelectorAll("[data-add-id]")
    .forEach((button) => {

      button.addEventListener("click", (event) => {

        event.stopPropagation();

        const id =
          button.getAttribute(
            "data-add-id"
          );

        add(id);

      });

    });


  // ===================================================
  // زر WhatsApp
  // ===================================================

  productsContainer
    .querySelectorAll("[data-order-id]")
    .forEach((button) => {

      button.addEventListener("click", (event) => {

        event.stopPropagation();

        const id =
          button.getAttribute(
            "data-order-id"
          );

        orderNow(id);

      });

    });


  renderCart();
}


// =====================================================
// صفحة تفاصيل المنتج
// =====================================================

function openProduct(id) {

  const productId = String(id);

  const p =
    products.find(
      (x) =>
        String(x.id) === productId
    );

  if (!p) {

    console.error(
      "المنتج غير موجود:",
      productId
    );

    return;
  }


  // حذف صفحة تفاصيل قديمة إذا كانت موجودة

  const oldModal =
    document.getElementById(
      "product-detail-modal"
    );

  if (oldModal) {
    oldModal.remove();
  }


  // الصورة

  let imageHTML = "";

  if (p.image) {

    imageHTML = `
      <div
        style="
          width:100%;
          max-width:600px;
          margin:auto;
          background:#f5f5f5;
          border-radius:16px;
          overflow:hidden;
        "
      >

        <img
          src="${p.image}"
          alt="${p.name}"
          style="
            width:100%;
            max-height:500px;
            object-fit:contain;
            display:block;
          "
          onerror="
            this.style.display='none';
            this.parentElement
              .querySelector('.detail-fallback')
              .style.display='flex';
          "
        >

        <div
          class="detail-fallback"
          style="
            display:none;
            height:350px;
            align-items:center;
            justify-content:center;
            font-size:100px;
          "
        >
          ${p.emoji || "🛍️"}
        </div>

      </div>
    `;

  } else {

    imageHTML = `
      <div
        style="
          width:100%;
          height:350px;
          background:#f5f5f5;
          border-radius:16px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:100px;
        "
      >
        ${p.emoji || "🛍️"}
      </div>
    `;
  }


  // السعر

  let priceHTML = "";

  if (
    Number(p.oldPrice || 0) >
    Number(p.price || 0)
  ) {

    priceHTML = `
      <div style="margin:15px 0;">

        <span
          style="
            text-decoration:line-through;
            color:#777;
            margin-left:10px;
          "
        >
          ${p.oldPrice} درهم
        </span>

        <strong
          style="
            color:#dc2626;
            font-size:25px;
          "
        >
          ${p.price} درهم
        </strong>

      </div>
    `;

  } else {

    priceHTML = `
      <div
        style="
          font-size:25px;
          font-weight:800;
          margin:15px 0;
        "
      >
        ${p.price} درهم
      </div>
    `;
  }


  // ===================================================
  // إنشاء صفحة التفاصيل
  // ===================================================

  const modal =
    document.createElement("div");

  modal.id =
    "product-detail-modal";

  modal.style.cssText = `
    position:fixed;
    inset:0;
    z-index:99999;
    background:rgba(0,0,0,.65);
    padding:15px;
    overflow-y:auto;
  `;


  modal.innerHTML = `

    <div
      style="
        max-width:650px;
        margin:20px auto;
        background:white;
        border-radius:20px;
        padding:18px;
        position:relative;
        direction:rtl;
      "
    >

      <button
        id="close-product-detail"
        type="button"
        style="
          position:absolute;
          top:10px;
          left:10px;
          width:40px;
          height:40px;
          border:0;
          border-radius:50%;
          background:#eee;
          font-size:22px;
          cursor:pointer;
          z-index:2;
        "
      >
        ✕
      </button>


      ${imageHTML}


      <div
        style="
          padding:10px 3px;
        "
      >

        <small
          style="
            color:#777;
          "
        >
          ${p.cat}
        </small>


        <h2
          style="
            margin:8px 0;
          "
        >
          ${p.name}
        </h2>


        ${
          p.desc
            ? `
              <p
                style="
                  line-height:1.8;
                  color:#444;
                "
              >
                ${p.desc}
              </p>
            `
            : ""
        }


        ${priceHTML}


        <button
          id="detail-add-cart"
          type="button"
          style="
            width:100%;
            padding:14px;
            border:0;
            border-radius:12px;
            background:#111;
            color:white;
            font-size:17px;
            font-weight:700;
            cursor:pointer;
          "
        >
          🛒 أضف للسلة
        </button>


        <button
          id="detail-whatsapp"
          type="button"
          style="
            width:100%;
            padding:14px;
            margin-top:10px;
            border:0;
            border-radius:12px;
            background:#25D366;
            color:white;
            font-size:17px;
            font-weight:700;
            cursor:pointer;
          "
        >
          🟢 أطلب الآن عبر WhatsApp
        </button>


        <div
          style="
            margin-top:15px;
            padding:12px;
            background:#f8f8f8;
            border-radius:12px;
            text-align:center;
          "
        >
          🚚 التوصيل لجميع المدن المغربية
          <br>
          💵 الدفع عند الاستلام
        </div>

      </div>

    </div>
  `;


  document.body.appendChild(modal);


  // إغلاق

  document
    .getElementById(
      "close-product-detail"
    )
    .onclick = () => {
      modal.remove();
    };


  // إضافة للسلة

  document
    .getElementById(
      "detail-add-cart"
    )
    .onclick = () => {

      add(p.id);

      modal.remove();

    };


  // WhatsApp

  document
    .getElementById(
      "detail-whatsapp"
    )
    .onclick = () => {

      orderNow(p.id);

    };


  // الضغط خارج النافذة

  modal.addEventListener(
    "click",
    (event) => {

      if (event.target === modal) {
        modal.remove();
      }

    }
  );
}


// =====================================================
// حساب التوصيل
// =====================================================

function getShipping(count) {

  count = Number(count || 0);

  if (count <= 0) {
    return 0;
  }

  if (count === 1) {
    return 30;
  }

  if (count === 2) {
    return 15;
  }

  return 0;
}


// =====================================================
// رسالة التوصيل
// =====================================================

function showShippingMessage(count) {

  let message = "";

  if (count === 1) {

    message =
      "🚚 أضفت منتج واحد. التوصيل بـ30 درهم.\n\n" +
      "💡 إلى ضفتي منتج آخر، التوصيل غادي يولي غير 15 درهم.";

  } else if (count === 2) {

    message =
      "🎉 عندك جوج منتجات!\n\n" +
      "🚚 التوصيل دابا غير بـ15 درهم.\n\n" +
      "💡 ضف منتج ثالث وخد التوصيل مجاني 🎁";

  } else if (count >= 3) {

    message =
      "🎉 مبروك!\n\n" +
      "🎁 حصلتي على التوصيل المجاني!";

  } else {

    return;
  }


  showToast(message);
}


// =====================================================
// Toast
// =====================================================

function showToast(message) {

  const old =
    document.getElementById(
      "awani-toast"
    );

  if (old) {
    old.remove();
  }


  const toast =
    document.createElement("div");

  toast.id =
    "awani-toast";

  toast.innerHTML =
    message.replace(
      /\n/g,
      "<br>"
    );


  toast.style.cssText = `
    position:fixed;
    bottom:25px;
    left:50%;
    transform:translateX(-50%);
    z-index:100000;
    width:calc(100% - 30px);
    max-width:450px;
    background:#111;
    color:white;
    padding:16px;
    border-radius:14px;
    text-align:center;
    font-size:15px;
    line-height:1.7;
    box-shadow:0 8px 30px rgba(0,0,0,.3);
  `;


  document.body.appendChild(toast);


  setTimeout(() => {

    if (toast) {
      toast.remove();
    }

  }, 4000);
}


// =====================================================
// صوت إضافة المنتج
// =====================================================

function playCartSound() {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const ctx =
      new AudioContext();

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();


    oscillator.type =
      "sine";

    oscillator.frequency.setValueAtTime(
      660,
      ctx.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      880,
      ctx.currentTime + 0.12
    );


    gain.gain.setValueAtTime(
      0.0001,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.15,
      ctx.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + 0.18
    );


    oscillator.connect(gain);

    gain.connect(ctx.destination);

    oscillator.start();

    oscillator.stop(
      ctx.currentTime + 0.2
    );

  } catch (error) {

    console.warn(
      "تعذر تشغيل صوت السلة:",
      error
    );

  }
}


// =====================================================
// إضافة للسلة
// =====================================================

let lastAddTime = 0;
let lastAddId = null;

function add(id) {

  const productId =
    String(id);

  const now =
    Date.now();


  // منع الضغط المزدوج السريع

  if (
    lastAddId === productId &&
    now - lastAddTime < 500
  ) {
    return;
  }


  lastAddId =
    productId;

  lastAddTime =
    now;


  // البحث عن المنتج

  const product =
    products.find(
      (p) =>
        String(p.id) ===
        productId
    );


  if (!product) {

    console.error(
      "❌ المنتج غير موجود:",
      productId
    );

    return;
  }


  // الكمية قبل الإضافة

  const beforeCount =
    Object.values(cart).reduce(
      (sum, qty) =>
        sum + Number(qty || 0),
      0
    );


  // إضافة

  cart[productId] =
    Number(
      cart[productId] || 0
    ) + 1;


  // حفظ

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  // الكمية بعد الإضافة

  const afterCount =
    beforeCount + 1;


  console.log(
    "🛒 تمت إضافة:",
    product.name,
    "الكمية:",
    cart[productId]
  );


  // صوت

  playCartSound();


  // تحديث السلة

  renderCart();


  // رسالة التوصيل

  showShippingMessage(
    afterCount
  );


  // مهم:
  // ما كنفتحوش السلة تلقائياً
}


// =====================================================
// تغيير الكمية
// =====================================================

function chg(id, amount) {

  const productId =
    String(id);

  const current =
    Number(
      cart[productId] || 0
    );

  const newQuantity =
    current +
    Number(amount || 0);


  if (newQuantity <= 0) {

    delete cart[
      productId
    ];

  } else {

    cart[
      productId
    ] =
      newQuantity;

  }


  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  renderCart();
}


// =====================================================
// فتح السلة
// =====================================================

function openCart() {

  const cartElement =
    $("#cart");

  if (!cartElement) {

    console.warn(
      "عنصر السلة #cart غير موجود."
    );

    return;
  }


  renderCart();

  cartElement.classList.add(
    "open"
  );
}


// =====================================================
// إغلاق السلة
// =====================================================

function closeCart() {

  const cartElement =
    $("#cart");

  if (!cartElement) {
    return;
  }

  cartElement.classList.remove(
    "open"
  );
}


// =====================================================
// عرض السلة
// =====================================================

function renderCart() {

  let count = 0;

  let productsTotal = 0;

  const rows = [];


  Object.keys(cart).forEach((id) => {

    const productId =
      String(id);

    const p =
      products.find(
        (x) =>
          String(x.id) ===
          productId
      );


    // إذا Firebase مازال ما كملش التحميل

    if (
      !p &&
      products.length === 0
    ) {
      return;
    }


    // إذا المنتج فعلاً غير موجود

    if (!p) {

      console.warn(
        "منتج غير موجود:",
        productId
      );

      delete cart[
        productId
      ];

      return;
    }


    const quantity =
      Number(
        cart[productId] || 0
      );


    if (quantity <= 0) {

      delete cart[
        productId
      ];

      return;
    }


    const price =
      Number(
        p.price || 0
      );


    count +=
      quantity;

    productsTotal +=
      price *
      quantity;


    rows.push(`

      <div
        class="row"
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          padding:12px 0;
          border-bottom:1px solid #eee;
        "
      >

        <span>

          <b>
            ${p.name}
          </b>

          <br>

          <small>
            ${price} درهم × ${quantity}
          </small>

        </span>


        <span
          style="
            display:flex;
            align-items:center;
            gap:8px;
            white-space:nowrap;
          "
        >

          <button
            type="button"
            onclick="chg('${productId}', -1)"
          >
            −
          </button>

          <b>
            ${quantity}
          </b>

          <button
            type="button"
            onclick="chg('${productId}', 1)"
          >
            +
          </button>

        </span>

      </div>

    `);

  });


  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  // التوصيل

  const shipping =
    getShipping(count);


  // المجموع

  const finalTotal =
    productsTotal +
    shipping;


  const items =
    $("#items");

  const countElement =
    $("#count");

  const totalElement =
    $("#total");


  // عرض السلة

  if (items) {

    if (count === 0) {

      items.innerHTML = `

        <div
          style="
            text-align:center;
            padding:30px 15px;
          "
        >

          <div
            style="
              font-size:45px;
              margin-bottom:10px;
            "
          >
            🛒
          </div>

          <p>
            السلة فارغة.
          </p>

          <small>
            أضف المنتجات التي تريد شراءها.
          </small>

        </div>

      `;

    } else {

      const shippingText =
        shipping === 0
          ? "مجاني 🎁"
          : shipping + " درهم";


      items.innerHTML = `

        ${rows.join("")}


        <div
          style="
            margin-top:15px;
            padding:12px;
            border-top:1px solid #ddd;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              margin-bottom:8px;
            "
          >

            <span>
              ثمن المنتجات:
            </span>

            <strong>
              ${productsTotal} درهم
            </strong>

          </div>


          <div
            style="
              display:flex;
              justify-content:space-between;
              margin-bottom:8px;
            "
          >

            <span>
              🚚 التوصيل:
            </span>

            <strong>
              ${shippingText}
            </strong>

          </div>


          <div
            style="
              display:flex;
              justify-content:space-between;
              font-size:18px;
              font-weight:800;
              margin-top:10px;
              padding-top:10px;
              border-top:1px solid #ddd;
            "
          >

            <span>
              المجموع النهائي:
            </span>

            <strong>
              ${finalTotal} درهم
            </strong>

          </div>

        </div>

      `;
    }
  }


  // العداد

  if (countElement) {
    countElement.textContent =
      count;
  }


  // المجموع

  if (totalElement) {
    totalElement.textContent =
      finalTotal;
  }

}


// =====================================================
// الطلب المباشر عبر WhatsApp
// =====================================================

function orderNow(id) {

  const productId =
    String(id);

  const p =
    products.find(
      (x) =>
        String(x.id) ===
        productId
    );


  if (!p) {

    alert(
      "تعذر العثور على المنتج."
    );

    return;
  }


  const phone =
    "212660234149";


  const message = `
السلام عليكم، أريد طلب المنتج:

🛍️ المنتج: ${p.name}

💰 الثمن: ${p.price} درهم

🚚 التوصيل: يتم تأكيده حسب عدد المنتجات.

المرجو تأكيد الطلب.
  `;


  const url =
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(
      message
    );


  window.open(
    url,
    "_blank"
  );
}


// =====================================================
// الطلب من السلة عبر WhatsApp
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const orderForm =
      document.getElementById(
        "order"
      );


    if (!orderForm) {
      return;
    }


    orderForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        if (
          Object.keys(cart)
            .length === 0
        ) {

          alert(
            "السلة فارغة."
          );

          return;
        }


        const formData =
          new FormData(
            orderForm
          );


        const name =
          formData.get(
            "name"
          ) || "";


        const phone =
          formData.get(
            "phone"
          ) || "";


        const address =
          formData.get(
            "address"
          ) || "";


        let message =
          "السلام عليكم، أريد تأكيد هذا الطلب:\n\n";


        let productsTotal = 0;

        let count = 0;


        Object.keys(cart)
          .forEach((id) => {

            const p =
              products.find(
                (x) =>
                  String(x.id) ===
                  String(id)
              );


            if (!p) return;


            const quantity =
              Number(
                cart[id] || 0
              );


            const price =
              Number(
                p.price || 0
              );


            const subtotal =
              price *
              quantity;


            count +=
              quantity;


            productsTotal +=
              subtotal;


            message +=
              `🛍️ ${p.name} × ${quantity} = ${subtotal} درهم\n`;

          });


        const shipping =
          getShipping(count);


        const finalTotal =
          productsTotal +
          shipping;


        message +=
          `\n💰 ثمن المنتجات: ${productsTotal} درهم\n`;


        message +=
          `🚚 التوصيل: ${
            shipping === 0
              ? "مجاني"
              : shipping + " درهم"
          }\n`;


        message +=
          `💵 المجموع النهائي: ${finalTotal} درهم\n\n`;


        message +=
          `👤 الاسم: ${name}\n`;


        message +=
          `📞 الهاتف: ${phone}\n`;


        message +=
          `📍 العنوان: ${address}`;


        const url =
          "https://wa.me/212660234149?text=" +
          encodeURIComponent(
            message
          );


        window.open(
          url,
          "_blank"
        );

      }
    );

  }
);


// =====================================================
// البحث
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const search =
      document.getElementById(
        "search"
      );

    const cat =
      document.getElementById(
        "cat"
      );


    if (search) {

      search.addEventListener(
        "input",
        render
      );

    }


    if (cat) {

      cat.addEventListener(
        "change",
        render
      );

    }

  }
);


// =====================================================
// تشغيل المتجر
// =====================================================

function startAwaniStore() {

  if (
    typeof db ===
    "undefined"
  ) {

    console.error(
      "❌ Firebase db غير موجود."
    );

    return;
  }


  loadProducts();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startAwaniStore
  );

} else {

  startAwaniStore();

}
