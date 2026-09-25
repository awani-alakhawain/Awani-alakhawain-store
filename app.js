// ===============================
// أواني الأخوين - APP.JS
// النسخة المصححة
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
// تحميل السلة القديمة بأمان
let cart = {};
try {
  const savedCart =
    localStorage.getItem("cart");
  if (savedCart) {
    const parsed =
      JSON.parse(savedCart);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      cart = parsed;
    }
  }
} catch (error) {
  console.warn(
    "تعذر تحميل السلة القديمة:",
    error
  );
  cart = {};
}
const $ = (s) =>
  document.querySelector(s);
// ===============================
// بانر العروض
// ===============================
let offerIndex = 0;
let offerTimer = null;
function renderFeaturedAd() {
  const ad =
    document.getElementById(
      "featured-ad"
    );
  if (!ad) {
    return;
  }
  const offers =
    products.filter((p) => {
      const oldPrice =
        Number(p.oldPrice || 0);
      const price =
        Number(p.price || 0);
      return oldPrice > price;
    });
  if (offers.length === 0) {
    ad.innerHTML = "";
    ad.style.display = "none";
    if (offerTimer) {
      clearInterval(
        offerTimer
      );
      offerTimer = null;
    }
    return;
  }
  ad.style.display = "block";
  if (
    offerIndex >=
    offers.length
  ) {
    offerIndex = 0;
  }
  function showOffer(index) {
    const p =
      offers[index];
    if (!p) {
      return;
    }
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
    const slide =
      ad.querySelector(
        ".offer-slide"
      );
    if (slide) {
      slide.onclick = () => {
        if (
          typeof openProduct ===
          "function"
        ) {
          openProduct(
            p.id
          );
        }
      };
      slide.classList.add(
        "offer-enter"
      );
      setTimeout(() => {
        slide.classList.remove(
          "offer-enter"
        );
      }, 700);
    }
  }
  showOffer(
    offerIndex
  );
  if (offerTimer) {
    clearInterval(
      offerTimer
    );
  }
  offerTimer =
    setInterval(() => {
      const currentOffers =
        products.filter((p) => {
          return (
            Number(
              p.oldPrice || 0
            ) >
            Number(
              p.price || 0
            )
          );
        });
      if (
        currentOffers.length ===
        0
      ) {
        clearInterval(
          offerTimer
        );
        offerTimer = null;
        ad.style.display =
          "none";
        return;
      }
      offerIndex++;
      if (
        offerIndex >=
        currentOffers.length
      ) {
        offerIndex = 0;
      }
      showOffer(
        offerIndex
      );
    }, 4000);
}
// ===============================
// تحميل المنتجات من Firebase
// ===============================
async function loadProducts() {
  try {
    console.log(
      "🔄 جاري تحميل المنتجات..."
    );
    const snapshot =
      await db
        .collection("products")
        .get();
    products = [];
    snapshot.forEach(
      (doc) => {
        const data =
          doc.data();
        products.push({
          id:
            doc.id,
          name:
            data.name || "",
          price:
            Number(
              data.price || 0
            ),
          oldPrice:
            Number(
              data.oldPrice || 0
            ),
          offer:
            data.offer === true,
          cat:
            data.cat ||
            "أخرى",
          emoji:
            data.emoji ||
            "🛍️",
          desc:
            data.desc ||
            "",
          image:
            data.image ||
            ""
        });
      }
    );
    console.log(
      "✅ عدد المنتجات:",
      products.length
    );
    // إذا Firebase فارغ فقط
    // نستعمل المنتجات التجريبية
    if (
      products.length === 0
    ) {
      products =
        [...starter];
    }
    render();
    renderFeaturedAd();
    // تشغيل الفئات إذا كانت موجودة
    if (
      typeof renderCategories ===
      "function"
    ) {
      renderCategories();
    }
    // لوحة الإدارة إذا كانت موجودة
    if (
      typeof auth !==
      "undefined" &&
      auth &&
      auth.currentUser
    ) {
      if (
        typeof renderAdmin ===
        "function"
      ) {
        renderAdmin();
      }
      if (
        typeof loadCategories ===
        "function"
      ) {
        loadCategories();
      }
    }
  }
  catch (error) {
    console.error(
      "❌ Firebase products error:",
      error
    );
    /*
      مهم:
      إذا وقع مشكل مؤقت مع Firebase
      ما نمسحوش المنتجات الموجودة.
    */
    if (
      products.length === 0
    ) {
      products =
        [...starter];
    }
    render();
    renderFeaturedAd();
    if (
      typeof renderCategories ===
      "function"
    ) {
      renderCategories();
    }
    alert(
      "وقع مشكل في تحميل المنتجات من Firebase."
    );
  }
}
// ===============================
// عرض المنتجات
// ===============================
function render() {
  const productsContainer =
    $("#products");
  // أهم إصلاح:
  // ما نوقفوش render بسبب search أو cat
  if (
    !productsContainer
  ) {
    console.warn(
      "العنصر #products غير موجود في الصفحة."
    );
    return;
  }
  const searchInput =
    $("#search");
  const catSelect =
    $("#cat");
  const q =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";
  const c =
    catSelect
      ? catSelect.value
      : "";
  // ===============================
  // الفئات
  // ===============================
  const cats = [
    ...new Set(
      products
        .map(
          (p) => p.cat
        )
        .filter(Boolean)
    )
  ];
  if (catSelect) {
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
  }
  // ===============================
  // البحث والفئة
  // ===============================
  const filtered =
    products.filter((p) => {
      const searchOK =
        !q ||
        String(
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
  // ===============================
  // المنتجات
  // ===============================
  if (
    filtered.length === 0
  ) {
    productsContainer.innerHTML =
      `
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
  productsContainer.innerHTML =
    filtered
      .map((p) => {
        // ===============================
        // صورة المنتج
        // ===============================
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
                  display:block;
                "
                onerror="
                  this.style.display='none';
                  this.nextElementSibling.style.display='flex';
                "
              >
              <div
                class="pic"
                style="
                  display:none;
                  height:220px;
                  align-items:center;
                  justify-content:center;
                  font-size:60px;
                "
              >
                ${p.emoji || "🛍️"}
              </div>
            `
            : `
              <div
                class="pic"
                style="
                  height:220px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:60px;
                "
              >
                ${p.emoji || "🛍️"}
              </div>
            `;
        // ===============================
        // الثمن
        // ===============================
        const offerHTML =
          Number(
            p.oldPrice || 0
          ) >
          Number(
            p.price || 0
          )
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
                  ${p.oldPrice}
                  درهم
                </span>
                <span
                  style="
                    color:#dc2626;
                    font-weight:800;
                  "
                >
                  ${p.price}
                  درهم
                </span>
              </div>
            `
            : `
              <div
                class="price"
              >
                ${p.price}
                درهم
              </div>
            `;
        return `
          <article
            class="card"
            onclick="
              if(typeof openProduct === 'function'){
                openProduct('${p.id}')
              }
            "
          >
            ${picture}
            <div
              class="body"
            >
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
              <!-- زر السلة -->
              <button
                class="add"
                type="button"
                onclick="
                  event.stopPropagation();
                  add('${p.id}');
                "
              >
                🛒 أضف للسلة
              </button>
              <!-- زر واتساب -->
              <button
                type="button"
                onclick="
                  event.stopPropagation();
                  orderNow('${p.id}');
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
      .join("");
  // تحديث السلة
  renderCart();
}
// ===============================
// حساب التوصيل
// ===============================
function getShipping(count) {
  count =
    Number(count || 0);
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
// إضافة للسلة
// ===============================
let lastAddTime = 0;
let lastAddId = null;
function add(id) {
  const productId =
    String(id);
  const now =
    Date.now();
  // منع double click
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
  console.log(
    "🛒 تمت إضافة:",
    product.name,
    "الكمية:",
    cart[productId]
  );
  // تحديث السلة
  renderCart();
  // فتح السلة
  openCart();
}
// ===============================
// تغيير الكمية
// ===============================
function chg(
  id,
  amount
) {
  const productId =
    String(id);
  const current =
    Number(
      cart[productId] || 0
    );
  const newQuantity =
    current +
    Number(amount || 0);
  if (
    newQuantity <= 0
  ) {
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
  renderCart();
  cartElement.classList.add(
    "open"
  );
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
  cartElement.classList.remove(
    "open"
  );
}
// ===============================
// عرض السلة
// ===============================
function renderCart() {
  let count = 0;
  let productsTotal = 0;
  const rows = [];
  // ===============================
  // المنتجات الموجودة في السلة
  // ===============================
  Object.keys(cart)
    .forEach((id) => {
      const productId =
        String(id);
      const p =
        products.find(
          (x) =>
            String(x.id) ===
            productId
        );
      /*
        مهم جداً:
        إذا products مازال ما تحملاش
        ما نحذفوش السلة.
      */
      if (
        !p &&
        products.length === 0
      ) {
        return;
      }
      // إذا المنتج فعلاً غير موجود
      if (!p) {
        console.warn(
          "منتج غير موجود في Firebase:",
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
      if (
        quantity <= 0
      ) {
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
              ${price}
              درهم ×
              ${quantity}
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
              onclick="
                chg('${productId}', -1)
              "
            >
              −
            </button>
            <b>
              ${quantity}
            </b>
            <button
              type="button"
              onclick="
                chg('${productId}', 1)
              "
            >
              +
            </button>
          </span>
        </div>
      `);
    });
  // حفظ بعد التنظيف
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
    productsTotal +
    shipping;
  const items =
    $("#items");
  const countElement =
    $("#count");
  const totalElement =
    $("#total");
  // ===============================
  // عرض السلة
  // ===============================
  if (items) {
    if (
      count === 0
    ) {
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
          : shipping +
            " درهم";
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
              ${productsTotal}
              درهم
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
              ${finalTotal}
              درهم
            </strong>
          </div>
        </div>
      `;
    }
  }
  // ===============================
  // العداد
  // ===============================
  if (
    countElement
  ) {
    countElement.textContent =
      count;
  }
  // ===============================
  // المجموع
  // ===============================
  if (
    totalElement
  ) {
    totalElement.textContent =
      finalTotal;
  }
  console.log(
    "🛒 السلة:",
    cart,
    "| العدد:",
    count,
    "| المجموع:",
    finalTotal
  );
}
// ===============================
// الطلب المباشر عبر واتساب
// ===============================
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
  const message =
    `السلام عليكم، أريد طلب المنتج:
🛍️ المنتج: ${p.name}
💰 الثمن: ${p.price} درهم
المرجو تأكيد الطلب.`;
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
// ===============================
// الطلب من السلة عبر واتساب
// ===============================
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
          "السلام عليكم، أريد تأكيد هذا الطلب:%0A%0A";
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
            if (!p) {
              return;
            }
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
              `🛍️ ${p.name} × ${quantity} = ${subtotal} درهم%0A`;
          });
        const shipping =
          getShipping(count);
        const finalTotal =
          productsTotal +
          shipping;
        message +=
          `%0A💰 ثمن المنتجات: ${productsTotal} درهم%0A`;
        message +=
          `🚚 التوصيل: ${
            shipping === 0
              ? "مجاني"
              : shipping + " درهم"
          }%0A`;
        message +=
          `💵 المجموع النهائي: ${finalTotal} درهم%0A%0A`;
        message +=
          `👤 الاسم: ${name}%0A`;
        message +=
          `📞 الهاتف: ${phone}%0A`;
        message +=
          `📍 العنوان: ${address}`;
        const url =
          "https://wa.me/212660234149?text=" +
          encodeURIComponent(
            decodeURIComponent(
              message
            )
          );
        window.open(
          url,
          "_blank"
        );
      }
    );
  }
);
// ===============================
// تشغيل تحميل المنتجات
// ===============================
/*
  نخلي Firebase يأخذ الأولوية.
  إذا كان db موجوداً، نبدأ التحميل.
*/
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
// إذا كانت الصفحة جاهزة
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
