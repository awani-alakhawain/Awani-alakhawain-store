// ======================================================
// أواني الأخوين - APP.JS
// نسخة كاملة ونظيفة
// ======================================================


// ======================================================
// منتجات احتياطية
// ======================================================

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


// ======================================================
// المتغيرات
// ======================================================

let products = [];

let cart = {};

try {
  cart = JSON.parse(
    localStorage.getItem("cart") || "{}"
  );

  if (
    !cart ||
    typeof cart !== "object" ||
    Array.isArray(cart)
  ) {
    cart = {};
  }

} catch (error) {
  cart = {};
}


const $ = (selector) =>
  document.querySelector(selector);


// ======================================================
// تحميل المنتجات من Firebase
// ======================================================

async function loadProducts() {

  try {

    if (
      typeof db === "undefined" ||
      !db ||
      !db.collection
    ) {
      console.error(
        "Firebase Firestore غير متوفر."
      );

      products = starter;

      render();

      return;
    }


    const snapshot =
      await db
        .collection("products")
        .get();


    products = [];


    snapshot.forEach((doc) => {

      const data = doc.data() || {};

      products.push({

        id: String(doc.id),

        name:
          data.name ||
          "منتج بدون اسم",

        price:
          Number(data.price || 0),

        oldPrice:
          Number(data.oldPrice || 0),

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

    });


    // إذا Firebase ما فيه حتى منتج
    if (products.length === 0) {

      products = starter.map((p) => ({
        ...p
      }));

    }


    console.log(
      "✅ المنتجات المحملة:",
      products
    );


    render();

    renderCart();

    renderFeaturedAd();

    renderCategories();

  }

  catch (error) {

    console.error(
      "❌ خطأ في تحميل المنتجات:",
      error
    );


    // نخلي المنتجات الاحتياطية تظهر
    products = starter.map((p) => ({
      ...p
    }));


    render();

    renderCart();

    renderFeaturedAd();

    renderCategories();

  }
}


// ======================================================
// عرض المنتجات
// ======================================================

function render() {

  const container =
    $("#products");


  if (!container) {

    console.warn(
      "لم يتم العثور على #products"
    );

    return;
  }


  const searchInput =
    $("#search");

  const categorySelect =
    $("#cat");


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


  const filtered =
    products.filter((product) => {

      const name =
        String(product.name || "")
          .toLowerCase();


      const searchOK =
        !search ||
        name.includes(search);


      const categoryOK =
        !selectedCategory ||
        product.cat === selectedCategory;


      return (
        searchOK &&
        categoryOK
      );

    });


  container.innerHTML = filtered.length

    ? filtered.map((p) => {

        const id =
          String(p.id);


        const imageHTML =
          p.image

            ? `
              <img
                src="${escapeHTML(p.image)}"
                alt="${escapeHTML(p.name)}"
                style="
                  width:100%;
                  height:220px;
                  object-fit:cover;
                  border-radius:12px;
                  display:block;
                "
              >
            `

            : `
              <div class="pic">
                ${p.emoji || "🛍️"}
              </div>
            `;


        const hasOffer =
          Number(p.oldPrice || 0) >
          Number(p.price || 0);


        const priceHTML =
          hasOffer

            ? `
              <div style="margin-top:6px">

                <span
                  style="
                    text-decoration:line-through;
                    color:#777;
                    margin-right:8px;
                  "
                >
                  ${p.oldPrice} درهم
                </span>

                <strong
                  style="
                    color:#dc2626;
                  "
                >
                  ${p.price} درهم
                </strong>

              </div>
            `

            : `
              <div
                class="price"
                style="margin-top:6px"
              >
                ${p.price} درهم
              </div>
            `;


        return `
          <article
            class="card"
            onclick="openProduct('${escapeJS(id)}')"
          >

            ${imageHTML}

            <div class="body">

              <h3>
                ${escapeHTML(p.name)}
              </h3>

              <small>
                ${escapeHTML(p.cat)}
              </small>

              ${
                p.desc
                  ? `
                    <p>
                      ${escapeHTML(p.desc)}
                    </p>
                  `
                  : ""
              }

              ${priceHTML}


              <button
                class="add"
                type="button"
                onclick="
                  event.stopPropagation();
                  add('${escapeJS(id)}');
                "
              >
                🛒 أضف للسلة
              </button>


              <button
                type="button"
                onclick="
                  event.stopPropagation();
                  orderNow('${escapeJS(id)}');
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

      }).join("")

    : `
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
}


// ======================================================
// إنشاء الفئات
// ======================================================

function renderCategories() {

  const select =
    $("#cat");


  if (!select) {
    return;
  }


  const current =
    select.value;


  const categories = [
    ...new Set(
      products
        .map((p) => p.cat)
        .filter(Boolean)
    )
  ];


  select.innerHTML = `
    <option value="">
      كل الفئات
    </option>

    ${
      categories
        .map((cat) => `
          <option
            value="${escapeHTML(cat)}"
            ${
              cat === current
                ? "selected"
                : ""
            }
          >
            ${escapeHTML(cat)}
          </option>
        `)
        .join("")
    }
  `;
}


// ======================================================
// البحث والفئات
// ======================================================

document.addEventListener(
  "input",
  function (event) {

    if (
      event.target &&
      event.target.id === "search"
    ) {
      render();
    }

  }
);


document.addEventListener(
  "change",
  function (event) {

    if (
      event.target &&
      event.target.id === "cat"
    ) {
      render();
    }

  }
);


// ======================================================
// السلة
// ======================================================

function renderCart() {

  const items =
    $("#items");

  const countElement =
    $("#count");

  const totalElement =
    $("#total");


  let count = 0;

  let productsTotal = 0;


  const rows = [];


  Object.keys(cart).forEach((id) => {

    const productId =
      String(id);


    const quantity =
      Number(cart[id] || 0);


    if (quantity <= 0) {
      return;
    }


    const product =
      products.find(
        (p) =>
          String(p.id) === productId
      );


    if (!product) {

      console.warn(
        "⚠️ المنتج غير موجود:",
        productId
      );

      return;
    }


    const price =
      Number(product.price || 0);


    count += quantity;

    productsTotal +=
      price * quantity;


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
            ${escapeHTML(product.name)}
          </b>

          <br>

          <small>
            ${price} درهم × ${quantity}
          </small>

        </span>


        <span
          style="
            white-space:nowrap;
          "
        >

          <button
            type="button"
            onclick="chg('${escapeJS(productId)}', -1)"
          >
            −
          </button>

          <b style="margin:0 8px">
            ${quantity}
          </b>

          <button
            type="button"
            onclick="chg('${escapeJS(productId)}', 1)"
          >
            +
          </button>

        </span>

      </div>

    `);

  });


  // ====================================================
  // التوصيل
  // ====================================================

  let shipping = 0;


  if (count === 1) {

    shipping = 30;

  } else if (count === 2) {

    shipping = 15;

  } else if (count >= 3) {

    shipping = 0;

  }


  const finalTotal =
    productsTotal + shipping;


  // ====================================================
  // عرض السلة
  // ====================================================

  if (items) {

    if (count === 0) {

      items.innerHTML = `
        <p
          style="
            text-align:center;
            padding:25px;
          "
        >
          🛒 السلة فارغة.
        </p>
      `;

    } else {

      const shippingText =
        count >= 3
          ? "مجاني 🎁"
          : `${shipping} درهم`;


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


  if (countElement) {

    countElement.textContent =
      count;

  }


  if (totalElement) {

    totalElement.textContent =
      finalTotal;

  }


  // حفظ السلة
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
}


// ======================================================
// إضافة للسلة
// ======================================================

function add(id) {

  id = String(id);


  cart[id] =
    Number(cart[id] || 0) + 1;


  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  renderCart();


  console.log(
    "🛒 تمت إضافة:",
    id,
    cart
  );

}


// ======================================================
// تغيير الكمية
// ======================================================

function chg(id, amount) {

  id = String(id);


  cart[id] =
    Number(cart[id] || 0) +
    Number(amount);


  if (cart[id] <= 0) {

    delete cart[id];

  }


  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  renderCart();

}


// ======================================================
// فتح السلة
// ======================================================

function openCart() {

  renderCart();


  const cartElement =
    $("#cart");


  if (cartElement) {

    cartElement.classList.add(
      "open"
    );

  }

}


// ======================================================
// إغلاق السلة
// ======================================================

function closeCart() {

  const cartElement =
    $("#cart");


  if (cartElement) {

    cartElement.classList.remove(
      "open"
    );

  }

}


// ======================================================
// الطلب مباشرة عبر WhatsApp
// ======================================================

function orderNow(id) {

  id = String(id);


  const product =
    products.find(
      (p) =>
        String(p.id) === id
    );


  if (!product) {

    alert(
      "المنتج غير موجود."
    );

    return;
  }


  const message =
    `السلام عليكم، أريد طلب:\n\n` +
    `المنتج: ${product.name}\n` +
    `الثمن: ${product.price} درهم\n\n` +
    `من متجر أواني الأخوين.`;


  const url =
    "https://wa.me/212660234149?text=" +
    encodeURIComponent(message);


  window.open(
    url,
    "_blank"
  );

}


// ======================================================
// صفحة / تفاصيل المنتج
// ======================================================

function openProduct(id) {

  id = String(id);


  const product =
    products.find(
      (p) =>
        String(p.id) === id
    );


  if (!product) {
    return;
  }


  // إذا كانت الصفحة فيها نافذة تفاصيل
  const modal =
    $("#product-modal");


  if (modal) {

    modal.innerHTML = `

      <div
        style="
          background:white;
          padding:20px;
          border-radius:15px;
          max-width:500px;
          margin:auto;
        "
      >

        ${
          product.image
            ? `
              <img
                src="${escapeHTML(product.image)}"
                style="
                  width:100%;
                  max-height:400px;
                  object-fit:contain;
                  border-radius:12px;
                "
              >
            `
            : `
              <div
                style="
                  font-size:80px;
                  text-align:center;
                "
              >
                ${product.emoji || "🛍️"}
              </div>
            `
        }


        <h2>
          ${escapeHTML(product.name)}
        </h2>


        <p>
          ${escapeHTML(product.desc || "")}
        </p>


        <strong>
          ${product.price} درهم
        </strong>


        <button
          type="button"
          onclick="add('${escapeJS(id)}')"
          style="
            width:100%;
            margin-top:15px;
          "
        >
          🛒 أضف للسلة
        </button>

      </div>

    `;


    modal.style.display =
      "block";


    return;
  }


  // إذا ما كانتش نافذة التفاصيل
  // نفتح السلة بعد الإضافة فقط عند الحاجة

  console.log(
    "المنتج:",
    product
  );

}


// ======================================================
// بانر العروض
// ======================================================

let offerTimer = null;


function renderFeaturedAd() {

  const ad =
    $("#featured-ad");


  if (!ad) {
    return;
  }


  const offers =
    products.filter(
      (p) =>
        Number(p.oldPrice || 0) >
        Number(p.price || 0)
    );


  if (offers.length === 0) {

    ad.innerHTML = "";

    ad.style.display =
      "none";

    if (offerTimer) {

      clearInterval(
        offerTimer
      );

      offerTimer = null;

    }

    return;
  }


  ad.style.display =
    "block";


  let index = 0;


  function show() {

    const p =
      offers[index];


    ad.innerHTML = `

      <div
        class="offer-slide"
        style="
          cursor:pointer;
        "
      >

        ${
          p.image

            ? `
              <img
                src="${escapeHTML(p.image)}"
                alt="${escapeHTML(p.name)}"
              >
            `

            : `
              <div class="offer-emoji">
                ${p.emoji || "🔥"}
              </div>
            `
        }


        <div class="offer-info">

          <div class="offer-title">
            🔥 ${escapeHTML(p.name)}
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

      slide.onclick =
        () => openProduct(p.id);

    }

  }


  show();


  if (offerTimer) {

    clearInterval(
      offerTimer
    );

  }


  offerTimer =
    setInterval(() => {

      index++;


      if (
        index >=
        offers.length
      ) {

        index = 0;

      }


      show();

    }, 4000);

}


// ======================================================
// أدوات الحماية
// ======================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeJS(value) {

  return String(value ?? "")
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    );

}


// ======================================================
// تشغيل الموقع
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "🛍️ أواني الأخوين - بدأ التشغيل"
    );


    // عرض السلة القديمة
    renderCart();


    // تحميل المنتجات
    loadProducts();

  }
);
