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
    desc: "طقم عملي للمطبخ.",
    emoji: "🍳",
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

let cart = JSON.parse(
  localStorage.getItem("cart") || "{}"
);


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


    const slide =
      ad.querySelector(".offer-slide");


    if (slide) {

      slide.onclick = () => {
        openProduct(p.id);
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

    renderCategories();


    if (auth.currentUser) {

      renderAdmin();

      loadCategories();

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

    renderCategories();


    if (auth.currentUser) {

      renderAdmin();

      loadCategories();

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


// ===============================
// السلة
// ===============================


// ===============================
// السلة + التوصيل
// ===============================
function renderCart() {
console.log("CART:", cart);
console.log("PRODUCTS:", products);
  let count = 0;
  let productsTotal = 0;

  const rows = Object.keys(cart)
    .map((id) => {

      // توحيد ID باش ما يكونش مشكل string / number
      const productId = String(id);

      const p = products.find(
        (x) => String(x.id) === productId
      );

      if (!p) {
        console.warn(
          "المنتج ما تلقاش فالسلة:",
          productId
        );
        return "";
      }

      const quantity = Number(cart[id] || 0);

      if (quantity <= 0) {
        return "";
      }

      const price = Number(p.price || 0);

      count += quantity;

      productsTotal += price * quantity;

      return `
        <div class="row">

          <span>
            <b>${p.name}</b>
            <br>
            ${price} درهم × ${quantity}
          </span>

          <span>

            <button
              type="button"
              onclick="chg('${productId}', -1)"
            >
              −
            </button>

            ${quantity}

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


  // ===============================
  // التوصيل
  // ===============================

  let shipping = 0;

  if (count === 1) {

    shipping = 30;

  } else if (count === 2) {

    shipping = 15;

  } else if (count >= 3) {

    shipping = 0;

  }


  // ===============================
  // المجموع النهائي
  // ===============================

  const finalTotal =
    productsTotal + shipping;


  const items = $("#items");
  const countElement = $("#count");
  const totalElement = $("#total");


  // ===============================
  // عرض السلة
  // ===============================

  if (items) {

    if (count === 0) {

      items.innerHTML = `
        <p style="
          text-align:center;
          padding:20px;
        ">
          🛒 السلة فارغة.
        </p>
      `;

    } else {

      const shippingText =
        shipping === 0 && count >= 3
          ? "مجاني 🎁"
          : shipping + " درهم";


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
  // عداد السلة
  // ===============================

  if (countElement) {

    countElement.textContent = count;

  }


  // ===============================
  // المجموع النهائي
  // ===============================

  if (totalElement) {

    totalElement.textContent = finalTotal;

  }

}
// ===============================
// إضافة للسلة
// ===============================

function add(id) {

  id = String(id);

  cart[id] = Number(cart[id] || 0) + 1;

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  renderCart();

  console.log("تمت إضافة المنتج:", id);
  console.log("السلة:", cart);
}


// ===============================
// تغيير الكمية
// ===============================

function chg(id, amount) {

  id = String(id);

  cart[id] =
    Number(cart[id] || 0) + Number(amount);

  if (cart[id] <= 0) {
    delete cart[id];
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

  // إعادة عرض السلة قبل فتحها
  renderCart();

  const cartElement =
    document.getElementById("cart");

  if (cartElement) {
    cartElement.classList.add("open");
  }
}


// ===============================
// إغلاق السلة
// ===============================

function closeCart() {

  const cartElement =
    document.getElementById("cart");

  if (cartElement) {
    cartElement.classList.remove("open");
  }
}


// ===============================
// تشغيل المتجر
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log("🛍️ أواني الأخوين بدأ التشغيل");

    loadProducts();

  }
);
