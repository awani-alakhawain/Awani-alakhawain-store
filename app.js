// ===============================
// أواني الأخوين - APP.JS
// ===============================
// ===============================
// المنتجات التجريبية
// ===============================
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
// ===============================
// المتغيرات
// ===============================
let products = [];
let cart = {};
try {
  const savedCart = localStorage.getItem("cart");
  cart = savedCart ? JSON.parse(savedCart) : {};
} catch (error) {
  console.warn("تعذر قراءة السلة القديمة:", error);
  cart = {};
}
if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
  cart = {};
}
const $ = (s) => document.querySelector(s);
// ===============================
// بانر العروض المتحرك
// ===============================
let offerIndex = 0;
let offerTimer = null;
function renderFeaturedAd() {
  const ad = document.getElementById("featured-ad");
  if (!ad) return;
  const offers = products.filter((p) => {
    const oldPrice = Number(p.oldPrice || 0);
    const price = Number(p.price || 0);
    return oldPrice > price;
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
    const image = p.image
      ? `
        <img
          src="${p.image}"
          alt="${p.name}"
        >
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
        if (typeof openProduct === "function") {
          openProduct(p.id);
        }
      };
      slide.classList.add("offer-enter");
      setTimeout(() => {
        slide.classList.remove("offer-enter");
      }, 700);
    }
  }
  showOffer(offerIndex);
  if (offerTimer) {
    clearInterval(offerTimer);
  }
  offerTimer = setInterval(() => {
    const currentOffers =
      products.filter((p) => {
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
    if (
      offerIndex >=
      currentOffers.length
    ) {
      offerIndex = 0;
    }
    showOffer(offerIndex);
  }, 4000);
}
// ===============================
// تحميل المنتجات من Firebase
// ===============================
async function loadProducts() {
  try {
    const snapshot =
      await db
        .collection("products")
        .get();
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
    if (products.length === 0) {
      products = starter;
    }
    render();
    renderFeaturedAd();
    if (typeof renderCategories === "function") {
      renderCategories();
    }
    if (
      typeof auth !== "undefined" &&
      auth.currentUser
    ) {
      if (typeof renderAdmin === "function") {
        renderAdmin();
      }
      if (typeof loadCategories === "function") {
        loadCategories();
      }
    }
  }
  catch (error) {
    console.error(
      "Firebase products error:",
      error
    );
    products = starter;
    render();
    renderFeaturedAd();
    if (typeof renderCategories === "function") {
      renderCategories();
    }
    if (
      typeof auth !== "undefined" &&
      auth.currentUser
    ) {
      if (typeof renderAdmin === "function") {
        renderAdmin();
      }
      if (typeof loadCategories === "function") {
        loadCategories();
      }
    }
    alert(
      "وقع مشكل في الاتصال بـ Firebase."
    );
  }
}
// ===============================
// عرض المنتجات
// ===============================
function render() {
  const searchInput =
    $("#search");
  const catSelect =
    $("#cat");
  if (
    !searchInput ||
    !catSelect
  ) {
    return;
  }
  const q =
    searchInput.value
      .toLowerCase()
      .trim();
  const c =
    catSelect.value;
  const cats = [
    ...new Set(
      products.map(
        (p) => p.cat
      )
    )
  ];
  catSelect.innerHTML =
    `
      <option value="">
        كل الفئات
      </option>
    ` +
    cats
      .map(
        (x) => `
          <option
            value="${x}"
            ${
              x === c
                ? "selected"
                : ""
            }
          >
            ${x}
          </option>
        `
      )
      .join("");
  const filtered =
    products.filter((p) => {
      const searchOK =
        !q ||
        (
          p.name || ""
        )
          .toLowerCase()
          .includes(q);
      const catOK =
        !c ||
        p.cat === c;
      return (
        searchOK &&
        catOK
      );
    });
  const productsContainer =
    $("#products");
  if (!productsContainer) {
    return;
  }
  productsContainer.innerHTML =
    filtered
      .map((p) => {
        const picture =
          p.image
            ? `
              <img
                src="${p.image}"
                alt="${p.name}"
                style="
                  width:100%;
                  height:220px;
                  object-fit:cover;
                  border-radius:12px;
                "
              >
            `
            : `
              <div class="pic">
                ${p.emoji || "🛍️"}
              </div>
            `;
        const offerHTML =
          Number(p.oldPrice || 0) >
          Number(p.price || 0)
            ? `
              <div
                style="
                  margin-top:5px;
                "
              >
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
            `
            : `
              <div class="price">
                ${p.price} درهم
              </div>
            `;
        return `
          <article
            class="card"
            onclick="openProduct('${p.id}')"
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
                onclick="
                  event.stopPropagation();
                  add('${p.id}')
                "
              >
                🛒 أضف للسلة
              </button>
              <button
                onclick="
                  event.stopPropagation();
                  orderNow('${p.id}')
                "
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
      })
      .join("")
      ||
      "<p>لا توجد منتجات.</p>";
  renderCart();
}
// ==================================================
// السلة - النسخة المصححة
// ==================================================
// منع الضغط المزدوج السريع على زر إضافة
let lastAddTime = 0;
let lastAddId = null;
// ===============================
// إضافة منتج للسلة
// ===============================
function add(id) {
  const now = Date.now();
  // منع double click
  if (
    lastAddId === String(id) &&
    now - lastAddTime < 500
  ) {
    return;
  }
  lastAddId = String(id);
  lastAddTime = now;
  const productId = String(id);
  // نتأكد أن المنتج موجود فعلاً
  const product = products.find(
    (p) => String(p.id) === productId
  );
  if (!product) {
    console.error(
      "المنتج غير موجود:",
      productId
    );
    alert(
      "تعذر العثور على هذا المنتج."
    );
    return;
  }
  // إضافة المنتج
  cart[productId] =
    Number(cart[productId] || 0) + 1;
  // حفظ السلة
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
  console.log(
    "🛒 تمت إضافة:",
    product.name,
    cart[productId]
  );
  // تحديث السلة
  renderCart();
  // فتح السلة تلقائياً
  openCart();
}
// ===============================
// تغيير كمية المنتج
// ===============================
function chg(id, amount) {
  const productId = String(id);
  const current =
    Number(cart[productId] || 0);
  const newQuantity =
    current + Number(amount || 0);
  if (newQuantity <= 0) {
    delete cart[productId];
  } else {
    cart[productId] =
      newQuantity;
  }
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
  renderCart();
}
// ===============================
// فتح السلة
// ===============================
function openCart() {
  const cartElement =
    $("#cart");
  if (!cartElement) {
    console.warn(
      "عنصر السلة #cart غير موجود."
    );
    return;
  }
  cartElement.classList.add("open");
  // تحديث السلة قبل عرضها
  renderCart();
}
// ===============================
// إغلاق السلة
// ===============================
function closeCart() {
  const cartElement =
    $("#cart");
  if (!cartElement) {
    return;
  }
  cartElement.classList.remove("open");
}
// ===============================
// حساب التوصيل
// ===============================
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
  // 3 منتجات أو أكثر
  return 0;
}
// ===============================
// عرض السلة
// ===============================
function renderCart() {
  let count = 0;
  let productsTotal = 0;
  const rows =
    Object.keys(cart)
      .map((id) => {
        const productId =
          String(id);
        const p =
          products.find(
            (x) =>
              String(x.id) === productId
          );
        // إذا كان المنتج لم يعد موجوداً
        // نحذفه من السلة
        if (!p) {
          console.warn(
            "المنتج ما تلقاش فالسلة، تم حذفه:",
            productId
          );
          delete cart[productId];
          return "";
        }
        const quantity =
          Number(cart[productId] || 0);
        if (quantity <= 0) {
          delete cart[productId];
          return "";
        }
        const price =
          Number(p.price || 0);
        count += quantity;
        productsTotal +=
          price * quantity;
        return `
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
        `;
      })
      .join("");
  // حفظ السلة بعد تنظيف المنتجات المحذوفة
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
  // ===============================
  // التوصيل
  // ===============================
  const shipping =
    getShipping(count);
  // ===============================
  // المجموع النهائي
  // ===============================
  const finalTotal =
    productsTotal + shipping;
  const items =
    $("#items");
  const countElement =
    $("#count");
  const totalElement =
    $("#total");
  // ===============================
  // عرض محتوى السلة
  // ===============================
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
          : `${shipping} درهم`;
      items.innerHTML = `
        ${rows}
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
  // ===============================
  // تحديث عداد السلة
  // ===============================
  if (countElement) {
    countElement.textContent =
      count;
  }
  // ===============================
  // تحديث المجموع
  // ===============================
  if (totalElement) {
    totalElement.textContent =
      finalTotal;
  }
  console.log(
    "🛒 CART:",
    cart,
    "| المنتجات:",
    products.length,
    "| العدد:",
    count,
    "| المجموع:",
    finalTotal
  );
}
