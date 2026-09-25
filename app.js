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
// =====================================================
// =====================================================
// لوحة الإدارة - تسجيل الدخول
// =====================================================
// =====================================================

function openLogin() {

  if (auth.currentUser) {
    openAdmin();
    return;
  }

  const login = $("#login");

  if (login) {
    login.classList.add("open");
  }
}


function closeLogin() {

  const login = $("#login");

  if (login) {
    login.classList.remove("open");
  }
}


// =====================================================
// تسجيل الدخول
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = $("#loginForm");

  if (!loginForm) return;

  loginForm.onsubmit = async (e) => {

    e.preventDefault();

    const email =
      $("#loginEmail")
        ? $("#loginEmail").value.trim()
        : "";

    const password =
      $("#loginPassword")
        ? $("#loginPassword").value
        : "";

    const message =
      $("#loginMessage");

    if (message) {
      message.textContent =
        "جاري تسجيل الدخول...";
    }

    try {

      await auth.signInWithEmailAndPassword(
        email,
        password
      );

      if (message) {
        message.textContent =
          "تم الدخول بنجاح ✅";
      }

      closeLogin();

      openAdmin();

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      if (message) {
        message.textContent =
          "الإيميل أو كلمة السر غير صحيحة ❌";
      }

    }

  };

});


// =====================================================
// فتح لوحة الإدارة
// =====================================================

function openAdmin() {

  if (!auth.currentUser) {
    openLogin();
    return;
  }

  const admin = $("#admin");

  if (admin) {
    admin.classList.add("open");
  }

  renderAdmin();

  loadCategories();
}


function closeAdmin() {

  const admin = $("#admin");

  if (admin) {
    admin.classList.remove("open");
  }

}


// =====================================================
// عرض المنتجات داخل لوحة الإدارة
// =====================================================

function renderAdmin() {

  if (
    typeof auth === "undefined" ||
    !auth.currentUser
  ) {
    return;
  }

  const list =
    $("#adminList");

  if (!list) return;


  const searchInput =
    $("#adminProductSearch");

  const categorySelect =
    $("#adminProductCategory");


  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  const selectedCategory =
    categorySelect
      ? categorySelect.value
      : "";


  // ===================================================
  // تحديث قائمة الفئات في الإدارة
  // ===================================================

  const categories = [
    ...new Set(
      products
        .map(p => p.cat)
        .filter(Boolean)
    )
  ];


  if (categorySelect) {

    const oldValue =
      categorySelect.value;

    categorySelect.innerHTML = `
      <option value="">
        كل الفئات
      </option>
    `;

    categories.forEach(cat => {

      const option =
        document.createElement("option");

      option.value = cat;

      option.textContent = cat;

      if (cat === oldValue) {
        option.selected = true;
      }

      categorySelect.appendChild(
        option
      );

    });

  }


  // ===================================================
  // تصفية المنتجات
  // ===================================================

  const filtered =
    products.filter(p => {

      const name =
        String(
          p.name || ""
        ).toLowerCase();


      const searchOK =
        !search ||
        name.includes(search);


      const categoryOK =
        !selectedCategory ||
        p.cat === selectedCategory;


      return (
        searchOK &&
        categoryOK
      );

    });


  // ===================================================
  // عرض المنتجات
  // ===================================================

  if (filtered.length === 0) {

    list.innerHTML = `
      <div
        style="
          padding:20px;
          text-align:center;
        "
      >
        لا توجد منتجات.
      </div>
    `;

    return;
  }


  list.innerHTML =
    filtered.map(p => {

      const image =
        p.image
          ? `
            <img
              src="${p.image}"
              alt="${p.name}"
              style="
                width:80px;
                height:80px;
                object-fit:cover;
                border-radius:12px;
              "
              onerror="
                this.style.display='none';
              "
            >
          `
          : `
            <div
              style="
                width:80px;
                height:80px;
                border-radius:12px;
                background:#f5f5f5;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:35px;
              "
            >
              ${p.emoji || "🛍️"}
            </div>
          `;


      const price =
        Number(p.price || 0);


      const oldPrice =
        Number(p.oldPrice || 0);


      const priceHTML =
        oldPrice > price
          ? `
            <span
              style="
                text-decoration:line-through;
                color:#777;
              "
            >
              ${oldPrice} درهم
            </span>

            <strong
              style="
                color:#dc2626;
                margin-right:8px;
              "
            >
              ${price} درهم
            </strong>
          `
          : `
            <strong>
              ${price} درهم
            </strong>
          `;


      return `
        <div
          class="adminrow"
          style="
            display:flex;
            gap:12px;
            align-items:center;
            padding:12px;
            margin-bottom:10px;
            border:1px solid #eee;
            border-radius:14px;
            background:#fff;
          "
        >

          ${image}

          <div
            style="
              flex:1;
              min-width:0;
            "
          >

            <b>
              ${p.name}
            </b>

            <br>

            <small>
              الفئة: ${p.cat || "أخرى"}
            </small>

            <br>

            <span>
              ${priceHTML}
            </span>

          </div>


          <div
            style="
              display:flex;
              flex-direction:column;
              gap:5px;
            "
          >

            <button
              type="button"
              onclick="edit('${p.id}')"
            >
              ✏️ تعديل
            </button>


            <button
              type="button"
              onclick="del('${p.id}')"
            >
              🗑️ حذف
            </button>


            <button
              type="button"
              onclick="shareProduct('${p.id}')"
            >
              📤 مشاركة
            </button>

          </div>

        </div>
      `;

    }).join("");

}


// =====================================================
// البحث داخل لوحة الإدارة
// =====================================================

document.addEventListener(
  "input",
  (event) => {

    if (
      event.target &&
      event.target.id ===
        "adminProductSearch"
    ) {

      renderAdmin();

    }

  }
);


document.addEventListener(
  "change",
  (event) => {

    if (
      event.target &&
      event.target.id ===
        "adminProductCategory"
    ) {

      renderAdmin();

    }

  }
);


// =====================================================
// تعديل منتج
// =====================================================

function edit(id) {

  const product =
    products.find(
      p =>
        String(p.id) ===
        String(id)
    );


  if (!product) {
    alert(
      "المنتج غير موجود."
    );
    return;
  }


  if ($("#editId")) {
    $("#editId").value =
      product.id;
  }


  if ($("#pname")) {
    $("#pname").value =
      product.name || "";
  }


  if ($("#pprice")) {
    $("#pprice").value =
      product.price || 0;
  }


  if ($("#poldprice")) {
    $("#poldprice").value =
      product.oldPrice || 0;
  }


  if ($("#poffer")) {
    $("#poffer").checked =
      Number(product.oldPrice || 0) >
      Number(product.price || 0);
  }


  if ($("#pcat")) {
    $("#pcat").value =
      product.cat || "أخرى";
  }


  if ($("#pdesc")) {
    $("#pdesc").value =
      product.desc || "";
  }


  if ($("#pimage")) {
    $("#pimage").value =
      product.image || "";
  }


  if ($("#pemoji")) {
    $("#pemoji").value =
      product.emoji || "🛍️";
  }


  openAdmin();

}


// =====================================================
// حفظ / إضافة منتج
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const productForm =
      $("#productForm");

    if (!productForm) return;


    productForm.onsubmit =
      async (e) => {

        e.preventDefault();


        if (!auth.currentUser) {

          alert(
            "خاصك تدخل لحساب الإدارة أولاً."
          );

          openLogin();

          return;
        }


        const editId =
          $("#editId")
            ? $("#editId").value.trim()
            : "";


        const name =
          $("#pname")
            ? $("#pname").value.trim()
            : "";


        const price =
          $("#pprice")
            ? Number(
                $("#pprice").value || 0
              )
            : 0;


        const oldPrice =
          $("#poldprice")
            ? Number(
                $("#poldprice").value || 0
              )
            : 0;


        const offerCheckbox =
          $("#poffer");


        const offer =
          offerCheckbox
            ? offerCheckbox.checked
            : oldPrice > price;


        const cat =
          $("#pcat")
            ? $("#pcat").value.trim()
            : "أخرى";


        const desc =
          $("#pdesc")
            ? $("#pdesc").value.trim()
            : "";


        const image =
          $("#pimage")
            ? $("#pimage").value.trim()
            : "";


        const emoji =
          $("#pemoji")
            ? $("#pemoji").value.trim()
            : "🛍️";


        if (!name) {

          alert(
            "دخل اسم المنتج."
          );

          return;
        }


        if (price < 0) {

          alert(
            "الثمن غير صحيح."
          );

          return;
        }


        const data = {

          name,

          price,

          oldPrice,

          offer:
            offer &&
            oldPrice > price,

          cat:
            cat || "أخرى",

          desc,

          image,

          emoji:
            emoji || "🛍️"

        };


        try {

          if (editId) {

            await db
              .collection("products")
              .doc(editId)
              .set(data, {
                merge:true
              });

          } else {

            await db
              .collection("products")
              .add(data);

          }


          productForm.reset();


          if ($("#editId")) {
            $("#editId").value = "";
          }


          alert(
            editId
              ? "تم تعديل المنتج بنجاح ✅"
              : "تمت إضافة المنتج بنجاح ✅"
          );


          await loadProducts();

          renderAdmin();


        } catch (error) {

          console.error(
            "Product save error:",
            error
          );

          alert(
            "وقع مشكل أثناء حفظ المنتج ❌"
          );

        }

      };

  }
);


// =====================================================
// حذف منتج
// =====================================================

async function del(id) {

  if (!auth.currentUser) {

    alert(
      "خاصك تدخل لحساب الإدارة أولاً."
    );

    openLogin();

    return;
  }


  const product =
    products.find(
      p =>
        String(p.id) ===
        String(id)
    );


  if (!product) return;


  const confirmed =
    confirm(
      `واش متأكد بغيتي تحذف "${product.name}"؟`
    );


  if (!confirmed) {
    return;
  }


  try {

    await db
      .collection("products")
      .doc(String(id))
      .delete();


    delete cart[
      String(id)
    ];


    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );


    alert(
      "تم حذف المنتج بنجاح ✅"
    );


    await loadProducts();

    renderAdmin();


  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );

    alert(
      "وقع مشكل أثناء حذف المنتج ❌"
    );

  }

}


// =====================================================
// مشاركة المنتج
// =====================================================

async function shareProduct(id) {

  const p =
    products.find(
      x =>
        String(x.id) ===
        String(id)
    );


  if (!p) return;


  const storeUrl =
    "https://awani-alakhawain.github.io/Awani-alakhawain-store/";


  const text =
    `🛍️ ${p.name}\n💰 ${p.price} درهم\n\n${p.desc || ""}`;


  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          p.name,

        text,

        url:
          storeUrl

      });

    } else {

      window.open(
        storeUrl,
        "_blank"
      );

    }

  } catch (error) {

    console.log(
      "Share cancelled."
    );

  }

}


// =====================================================
// مشاركة المتجر على Facebook
// =====================================================

function shareOnFacebook(id) {

  const storeUrl =
    "https://awani-alakhawain.github.io/Awani-alakhawain-store/";


  const p =
    products.find(
      x =>
        String(x.id) ===
        String(id)
    );


  const quote =
    p
      ? `🛍️ ${p.name} - ${p.price} درهم`
      : "أواني الأخوين";


  const url =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(
      storeUrl
    ) +
    "&quote=" +
    encodeURIComponent(
      quote
    );


  window.open(
    url,
    "_blank",
    "width=700,height=600"
  );

}


// =====================================================
// استيراد صور GitHub
// =====================================================

async function importGitHubImages() {

  if (!auth.currentUser) {

    alert(
      "خاصك تدخل لحساب الإدارة أولاً."
    );

    openLogin();

    return;
  }


  const apiUrl =
    "https://api.github.com/repos/awani-alakhawain/Awani-alakhawain-store/contents/";


  try {

    const response =
      await fetch(apiUrl);


    if (!response.ok) {
      throw new Error(
        "GitHub API error"
      );
    }


    const files =
      await response.json();


    const images =
      files.filter(
        file =>
          file.type === "file" &&
          /\.(jpg|jpeg|png|webp|gif)$/i.test(
            file.name
          )
      );


    if (!images.length) {

      alert(
        "ما لقيتش صور فـGitHub."
      );

      return;
    }


    let added = 0;


    for (
      const file of images
    ) {

      const imageUrl =
        "https://raw.githubusercontent.com/awani-alakhawain/Awani-alakhawain-store/main/" +
        encodeURIComponent(
          file.name
        );


      const exists =
        products.some(
          p =>
            p.image ===
            imageUrl
        );


      if (exists) {
        continue;
      }


      await db
        .collection("products")
        .add({

          name:
            "منتج جديد",

          price:
            0,

          oldPrice:
            0,

          offer:
            false,

          cat:
            "أخرى",

          desc:
            "",

          image:
            imageUrl,

          emoji:
            "🛍️"

        });


      added++;

    }


    alert(
      "تم استيراد " +
      added +
      " منتج جديد بنجاح ✅"
    );


    await loadProducts();


  } catch (error) {

    console.error(
      "GitHub import error:",
      error
    );


    alert(
      "وقع مشكل أثناء استيراد الصور ❌"
    );

  }

}


// =====================================================
// =====================================================
// إدارة الفئات
// =====================================================
// =====================================================


// =====================================================
// تحميل الفئات داخل لوحة الإدارة
// =====================================================

async function loadCategories() {

  if (
    typeof auth === "undefined" ||
    !auth.currentUser
  ) {
    return;
  }


  const adminList =
    $("#categoryAdminList");


  if (!adminList) {
    return;
  }


  try {

    const snapshot =
      await db
        .collection("categories")
        .get();


    const categories = [];


    snapshot.forEach(doc => {

      categories.push({

        id:
          doc.id,

        ...doc.data()

      });

    });


    if (categories.length === 0) {

      adminList.innerHTML = `
        <p>
          مازال ما كايناش فئات.
        </p>
      `;

      return;
    }


    adminList.innerHTML =
      categories.map(cat => {

        const image =
          cat.image
            ? `
              <img
                src="${cat.image}"
                alt="${cat.name}"
                style="
                  width:60px;
                  height:60px;
                  object-fit:cover;
                  border-radius:10px;
                "
              >
            `
            : `
              <div
                style="
                  width:60px;
                  height:60px;
                  border-radius:10px;
                  background:#f5f5f5;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:30px;
                "
              >
                🛍️
              </div>
            `;


        return `
          <div
            class="adminrow"
            style="
              display:flex;
              align-items:center;
              gap:10px;
              padding:10px;
              margin-bottom:8px;
              border:1px solid #eee;
              border-radius:12px;
            "
          >

            ${image}

            <div
              style="
                flex:1;
              "
            >
              <b>
                ${cat.name || "بدون اسم"}
              </b>
            </div>


            <button
              type="button"
              onclick="editCategory('${cat.id}')"
            >
              ✏️
            </button>


            <button
              type="button"
              onclick="deleteCategory('${cat.id}')"
            >
              🗑️
            </button>

          </div>
        `;

      }).join("");


  } catch (error) {

    console.error(
      "Categories error:",
      error
    );


    alert(
      "وقع مشكل في تحميل الفئات ❌"
    );

  }

}


// =====================================================
// إضافة / تعديل فئة
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const categoryForm =
      $("#categoryForm");


    if (!categoryForm) {
      return;
    }


    categoryForm.onsubmit =
      async (e) => {

        e.preventDefault();


        if (!auth.currentUser) {

          alert(
            "خاصك تدخل لحساب الإدارة أولاً."
          );

          openLogin();

          return;
        }


        const editId =
          $("#editCategoryId")
            ? $("#editCategoryId")
                .value
                .trim()
            : "";


        const name =
          $("#categoryName")
            ? $("#categoryName")
                .value
                .trim()
            : "";


        const image =
          $("#categoryImage")
            ? $("#categoryImage")
                .value
                .trim()
            : "";


        if (!name) {

          alert(
            "دخل اسم الفئة."
          );

          return;
        }


        try {

          const data = {

            name,

            image

          };


          if (editId) {

            await db
              .collection("categories")
              .doc(editId)
              .set(data, {
                merge:true
              });

          } else {

            await db
              .collection("categories")
              .add(data);

          }


          categoryForm.reset();


          if ($("#editCategoryId")) {
            $("#editCategoryId").value = "";
          }


          alert(
            editId
              ? "تم تعديل الفئة بنجاح ✅"
              : "تمت إضافة الفئة بنجاح ✅"
          );


          await loadCategories();

          renderCategories();


        } catch (error) {

          console.error(
            "Category save error:",
            error
          );


          alert(
            "وقع مشكل أثناء حفظ الفئة ❌"
          );

        }

      };

  }
);


// =====================================================
// تعديل فئة
// =====================================================

async function editCategory(id) {

  try {

    const doc =
      await db
        .collection("categories")
        .doc(String(id))
        .get();


    if (!doc.exists) {

      alert(
        "الفئة غير موجودة."
      );

      return;
    }


    const data =
      doc.data();


    if ($("#editCategoryId")) {
      $("#editCategoryId").value =
        doc.id;
    }


    if ($("#categoryName")) {
      $("#categoryName").value =
        data.name || "";
    }


    if ($("#categoryImage")) {
      $("#categoryImage").value =
        data.image || "";
    }


    openAdmin();


  } catch (error) {

    console.error(
      "Edit category error:",
      error
    );


    alert(
      "وقع مشكل في تحميل الفئة ❌"
    );

  }

}


// =====================================================
// حذف فئة
// =====================================================

async function deleteCategory(id) {

  if (!auth.currentUser) {

    alert(
      "خاصك تدخل لحساب الإدارة أولاً."
    );

    openLogin();

    return;
  }


  const confirmed =
    confirm(
      "واش متأكد بغيتي تحذف هاد الفئة؟"
    );


  if (!confirmed) {
    return;
  }


  try {

    await db
      .collection("categories")
      .doc(String(id))
      .delete();


    alert(
      "تم حذف الفئة بنجاح ✅"
    );


    await loadCategories();

    renderCategories();


  } catch (error) {

    console.error(
      "Delete category error:",
      error
    );


    alert(
      "وقع مشكل أثناء حذف الفئة ❌"
    );

  }

}


// =====================================================
// عرض الفئات للزبناء
// =====================================================

async function renderCategories() {

  const container =
    $("#categories");


  if (!container) {
    return;
  }


  try {

    const snapshot =
      await db
        .collection("categories")
        .get();


    const categories = [];


    snapshot.forEach(doc => {

      categories.push({

        id:
          doc.id,

        ...doc.data()

      });

    });


    // إذا ما كايناش فئات في Firebase
    // نولد الفئات من المنتجات

    if (categories.length === 0) {

      const productCategories = [
        ...new Set(
          products
            .map(p => p.cat)
            .filter(Boolean)
        )
      ];


      container.innerHTML =
        productCategories
          .map(cat => {

            return `
              <button
                type="button"
                onclick="selectCategory('${String(cat).replace(/'/g, "\\'")}')"
                style="
                  cursor:pointer;
                "
              >
                🛍️ ${cat}
              </button>
            `;

          })
          .join("");


      return;
    }


    container.innerHTML =
      categories.map(cat => {

        const name =
          cat.name || "أخرى";


        const image =
          cat.image
            ? `
              <img
                src="${cat.image}"
                alt="${name}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                  border-radius:12px;
                "
                onerror="
                  this.style.display='none';
                  if(this.nextElementSibling){
                    this.nextElementSibling.style.display='flex';
                  }
                "
              >

              <span
                style="
                  display:none;
                  width:100%;
                  height:100%;
                  align-items:center;
                  justify-content:center;
                  font-size:35px;
                "
              >
                🛍️
              </span>
            `
            : `
              <span
                style="
                  display:flex;
                  width:100%;
                  height:100%;
                  align-items:center;
                  justify-content:center;
                  font-size:35px;
                "
              >
                🛍️
              </span>
            `;


        return `
          <div
            class="category-card"
            onclick="selectCategory('${String(name).replace(/'/g, "\\'")}')"
            style="
              cursor:pointer;
            "
          >

            <div
              style="
                width:70px;
                height:70px;
                margin:auto;
                border-radius:12px;
                overflow:hidden;
                background:#f5f5f5;
              "
            >
              ${image}
            </div>


            <div
              style="
                margin-top:7px;
                text-align:center;
              "
            >
              ${name}
            </div>

          </div>
        `;

      }).join("");


  } catch (error) {

    console.error(
      "Render categories error:",
      error
    );


    container.innerHTML = "";

  }

}


// =====================================================
// اختيار فئة
// =====================================================

function selectCategory(categoryName) {

  const cat =
    $("#cat");


  if (cat) {

    cat.value =
      categoryName;

  }


  render();


  const productsSection =
    $("#products");


  if (productsSection) {

    productsSection.scrollIntoView({
      behavior:
        "smooth"
    });

  }

}


// =====================================================
// مراقبة تسجيل الدخول
// =====================================================

if (
  typeof auth !== "undefined"
) {

  auth.onAuthStateChanged(
    (user) => {

      if (user) {

        console.log(
          "👤 تم تسجيل الدخول للإدارة."
        );


        if (
          document.getElementById(
            "admin"
          )
        ) {

          renderAdmin();

          loadCategories();

        }

      } else {

        console.log(
          "👤 لا يوجد حساب إدارة مسجل."
        );

      }

    }
  );

}
