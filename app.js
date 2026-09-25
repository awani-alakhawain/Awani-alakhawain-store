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

localStorage.removeItem("cart");
cart = {};
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

function renderCart() {

  let count = 0;

  let total = 0;


  const html =

    Object.keys(cart)

      .map((id) => {

        const p =
          products.find(
            (x) => x.id === id
          );


        if (!p) {
          return "";
        }


        const quantity =
          Number(cart[id]);


        count += quantity;

        total +=
          p.price *
          quantity;


        return `

          <div class="row">

            <span>

              ${p.name}

              <br>

              ${p.price}
              ×
              ${quantity}

            </span>


            <span>

              <button
                onclick="
                  chg('${id}', -1)
                "
              >
                −
              </button>

              ${quantity}

              <button
                onclick="
                  chg('${id}', 1)
                "
              >
                +
              </button>

            </span>

          </div>

        `;

      })

      .join("");


  const items =
    $("#items");

  const countElement =
    $("#count");

  const totalElement =
    $("#total");


  if (items) {

    items.innerHTML =
      html ||
      "<p>السلة فارغة.</p>";
  }


  if (countElement) {

    countElement.textContent =
      count;
  }


  if (totalElement) {

    totalElement.textContent =
      total;
  }
}


// ===============================
// إضافة للسلة + صوت + عروض
// ===============================

// ===============================
// أصوات تحفيزية مختلفة
// ===============================

let cartAudioContext = null;

function playCartSound(level = 1) {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }


    if (!cartAudioContext) {

      cartAudioContext =
        new AudioContext();

    }


    if (
      cartAudioContext.state ===
      "suspended"
    ) {

      cartAudioContext.resume();

    }


    const ctx =
      cartAudioContext;


    const playTone = (
      frequency,
      start,
      duration,
      volume
    ) => {

      const oscillator =
        ctx.createOscillator();

      const gain =
        ctx.createGain();


      oscillator.type =
        "sine";


      oscillator.frequency.setValueAtTime(
        frequency,
        ctx.currentTime + start
      );


      gain.gain.setValueAtTime(
        0.0001,
        ctx.currentTime + start
      );


      gain.gain.exponentialRampToValueAtTime(
        volume,
        ctx.currentTime + start + 0.02
      );


      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + start + duration
      );


      oscillator.connect(gain);

      gain.connect(
        ctx.destination
      );


      oscillator.start(
        ctx.currentTime + start
      );

      oscillator.stop(
        ctx.currentTime + start + duration
      );

    };


    // المنتج الأول 🔔
    if (level === 1) {

      playTone(
        620,
        0,
        0.18,
        0.045
      );

      playTone(
        820,
        0.10,
        0.20,
        0.035
      );

    }


    // المنتج الثاني 🎉
    else if (level === 2) {

      playTone(
        660,
        0,
        0.16,
        0.045
      );

      playTone(
        880,
        0.12,
        0.18,
        0.05
      );

      playTone(
        1040,
        0.24,
        0.22,
        0.045
      );

    }


    // المنتج الثالث 🏆
    else if (level === 3) {

      playTone(
        660,
        0,
        0.15,
        0.045
      );

      playTone(
        830,
        0.12,
        0.16,
        0.05
      );

      playTone(
        1100,
        0.24,
        0.28,
        0.06
      );

    }


    // المنتجات من الرابع فما فوق
    else {

      playTone(
        750,
        0,
        0.14,
        0.035
      );

    }

  }

  catch (error) {

    console.log(
      "Cart sound unavailable"
    );

  }
}
  catch (error) {

    console.log(
      "Cart sound unavailable"
    );

  }
}


function showCartMessage(
  message,
  type = "normal"
) {

  let box =
    document.getElementById(
      "cart-message"
    );


  if (!box) {

    box =
      document.createElement(
        "div"
      );

    box.id =
      "cart-message";

    document.body.appendChild(
      box
    );

  }


  box.className =
    "cart-message " + type;


  box.innerHTML =
    message;


  box.style.display =
    "block";


  clearTimeout(
    box.hideTimer
  );


  box.hideTimer =
    setTimeout(
      () => {

        box.style.display =
          "none";

      },
      3500
    );

}



// ===============================
// إضافة للسلة - نسخة مضبوطة
// ===============================

let lastAddTime = 0;
let lastAddId = null;

function add(id) {

  // منع نفس الضغط من يتسجل أكثر من مرة بسرعة
  const now = Date.now();

  if (
    lastAddId === id &&
    now - lastAddTime < 500
  ) {
    return;
  }

  lastAddId = id;
  lastAddTime = now;


  // العدد الحقيقي قبل الإضافة
  let beforeTotal = Object.values(cart).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0
  );


  // إضافة قطعة واحدة فقط
  cart[id] = Number(cart[id] || 0) + 1;


  // العدد الحقيقي بعد الإضافة
  let afterTotal = Object.values(cart).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0
  );


  // حفظ السلة
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );


  console.log(
    "🛒 Cart:",
    beforeTotal,
    "→",
    afterTotal
  );


  // ===============================
  // الرسائل التحفيزية
  // ===============================

  if (afterTotal === 1) {

    playCartSound(1);

    showCartMessage(
      `
      ✨ زوين! تزاد المنتج للسلة 🛒
      <br>
      <span style="font-size:12px;">
        زيد منتج آخر واستافد من التوصيل غير بـ
        <b>15 درهم</b> 🚚
      </span>
      `,
      "normal"
    );

  }

  else if (afterTotal === 2) {

    playCartSound(2);

    showCartMessage(
      `
      🔥 برافو! وصلتي لجوج منتجات 🎉
      <br>
      <span style="font-size:12px;">
        بقا غير <b>منتج واحد</b>
        وتربح
        <b>التوصيل مجاناً 🎁</b>
      </span>
      `,
      "reward"
    );

  }

  else if (afterTotal === 3) {

    playCartSound(3);

    showCartMessage(
      `
      🎉🏆 مبروك! ربحتي التوصيل مجاناً!
      🚚✨
      <br>
      <span style="font-size:12px;">
        وصلتي لـ <b>3 منتجات</b>
        — التوصيل ديالك مجاني 🎁
      </span>
      `,
      "free"
    );

  }

  else {

    playCartSound(4);

    showCartMessage(
      `
      🛒 تزاد المنتج للسلة ✓
      <br>
      <span style="font-size:12px;">
        عندك دابا <b>${afterTotal} منتجات</b>
        والتوصيل باقي مجاني 🎁🚚
      </span>
      `,
      "free"
    );

  }


  // تحديث العداد والسلة
  renderCart();


  // ⚠️ مهم:
  // ما كايناش openCart()
}

// ===============================
// تغيير الكمية
// ===============================

function chg(
  id,
  amount
) {

  cart[id] =
    (cart[id] || 0) +
    amount;


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

  const cartElement =
    $("#cart");


  if (cartElement) {

    cartElement.classList.add(
      "open"
    );

  }
}


function closeCart() {

  const cartElement =
    $("#cart");


  if (cartElement) {

    cartElement.classList.remove(
      "open"
    );

  }
}


// ===============================
// تسجيل الدخول
// ===============================

function openLogin() {

  if (auth.currentUser) {

    openAdmin();

    return;
  }


  const login =
    $("#login");


  if (login) {

    login.classList.add(
      "open"
    );

  }
}


function closeLogin() {

  const login =
    $("#login");


  if (login) {

    login.classList.remove(
      "open"
    );

  }
}


// ===============================
// Login Form
// ===============================

const loginForm =
  $("#loginForm");


if (loginForm) {

  loginForm.onsubmit =
    async (e) => {

      e.preventDefault();


      const email =
        $("#loginEmail")
          .value
          .trim();


      const password =
        $("#loginPassword")
          .value;


      const message =
        $("#loginMessage");


      if (message) {

        message.textContent =
          "جاري تسجيل الدخول...";

      }


      try {

        await auth
          .signInWithEmailAndPassword(
            email,
            password
          );


        if (message) {

          message.textContent =
            "تم الدخول بنجاح ✅";

        }


        closeLogin();

        openAdmin();

      }

      catch (error) {

        console.error(error);


        if (message) {

          message.textContent =
            "الإيميل أو كلمة السر غير صحيحة ❌";

        }

      }

    };

}


// ===============================
// إدارة المتجر
// ===============================

function openAdmin() {

  if (!auth.currentUser) {

    openLogin();

    return;
  }


  const admin =
    $("#admin");


  if (admin) {

    admin.classList.add(
      "open"
    );

  }


  renderAdmin();

  loadCategories();
}


function closeAdmin() {

  const admin =
    $("#admin");


  if (admin) {

    admin.classList.remove(
      "open"
    );

  }
}


// ===============================
// قائمة الإدارة
// ===============================

function renderAdmin() {

  if (!auth.currentUser) {

    const adminList =
      $("#adminList");


    if (adminList) {

      adminList.innerHTML =
        "";

    }

    return;
  }


  const searchInput =
    $("#adminProductSearch");


  const categorySelect =
    $("#adminProductCategory");


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const selectedCategory =
    categorySelect
      ? categorySelect.value
      : "";


  const categories = [

    ...new Set(

      products

        .map(
          (p) => p.cat
        )

        .filter(Boolean)

    )

  ];


  if (categorySelect) {

    const currentValue =
      categorySelect.value;


    categorySelect.innerHTML =

      `
        <option value="">
          📂 كل الفئات
        </option>
      ` +

      categories

        .map(
          (cat) => `
            <option
              value="${cat}"
            >
              ${cat}
            </option>
          `
        )

        .join("");


    categorySelect.value =

      categories.includes(
        currentValue
      )

        ? currentValue

        : "";
  }


  const filteredProducts =

    products.filter((p) => {

      const name =
        (p.name || "")
          .toLowerCase();


      const category =
        p.cat || "";


      const searchOK =

        !search ||
        name.includes(search);


      const categoryOK =

        !selectedCategory ||
        category ===
          selectedCategory;


      return (
        searchOK &&
        categoryOK
      );

    });


  const adminList =
    $("#adminList");


  if (!adminList) {
    return;
  }


  adminList.innerHTML =

    filteredProducts.length

      ?

        filteredProducts

          .map((p) => {

            const offer =

              Number(
                p.oldPrice || 0
              ) >

              Number(
                p.price || 0
              );


            return `

              <div
                class="adminrow"
              >

                ${
                  p.image

                    ? `
                      <img
                        src="${p.image}"
                        alt="${p.name}"
                        style="
                          width:70px;
                          height:70px;
                          object-fit:cover;
                          border-radius:10px;
                          display:block;
                          margin-bottom:8px;
                        "
                      >
                    `

                    : ""
                }


                <b>
                  ${p.name}
                </b>


                —

                ${
                  offer

                    ? `
                      <span
                        style="
                          text-decoration:line-through;
                          color:#777;
                        "
                      >
                        ${p.oldPrice}dh
                      </span>

                      <strong
                        style="
                          color:#dc2626;
                        "
                      >
                        ${p.price}dh
                      </strong>
                    `

                    : `
                      ${p.price}dh
                    `
                }


                <br>


                <small>
                  📂 ${p.cat}
                </small>


                ${
                  offer
                    ? `
                      <br>

                      <small
                        style="
                          color:#dc2626;
                          font-weight:bold;
                        "
                      >
                        🔥 عرض محدود
                      </small>
                    `
                    : ""
                }


                <br>


                <button
                  onclick="
                    edit('${p.id}')
                  "
                >
                  ✏️ تعديل
                </button>


                <button
                  onclick="
                    del('${p.id}')
                  "
                >
                  🗑️ حذف
                </button>


                <button
                  onclick="
                    shareOnFacebook('${p.id}')
                  "
                >
                  📘 نشر في Facebook
                </button>


                <button
                  onclick="
                    shareProduct('${p.id}')
                  "
                >
                  📢 مشاركة المنتج
                </button>

              </div>

            `;

          })

          .join("")

      :

        "<p>🔎 ما لقيتش هاد المنتج.</p>";

}


// ===============================
// البحث داخل الإدارة
// ===============================

document.addEventListener(
  "input",
  function (e) {

    if (
      e.target &&
      e.target.id ===
        "adminProductSearch"
    ) {

      renderAdmin();

    }

  }
);


// ===============================
// فلترة الإدارة
// ===============================

document.addEventListener(
  "change",
  function (e) {

    if (
      e.target &&
      e.target.id ===
        "adminProductCategory"
    ) {

      renderAdmin();

    }

  }
);


// ===============================
// تعديل منتج
// ===============================

function edit(id) {

  const p =
    products.find(
      (x) => x.id === id
    );


  if (!p) {
    return;
  }


  $("#editId").value =
    p.id;


  $("#pname").value =
    p.name;


  $("#pprice").value =
    p.price;


  const oldPriceInput =
    $("#poldprice");


  if (oldPriceInput) {

    oldPriceInput.value =
      p.oldPrice || "";

  }


  const offerCheckbox =
    $("#poffer");


  if (offerCheckbox) {

    offerCheckbox.checked =
      p.offer === true;

  }


  $("#pcat").value =
    p.cat;


  $("#pdesc").value =
    p.desc || "";


  $("#pimage").value =
    p.image || "";


  $("#pemoji").value =
    p.emoji || "";


  openAdmin();

}


// ===============================
// إضافة / تعديل المنتج
// ===============================

const productForm =
  $("#productForm");


if (productForm) {

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


      const id =
        $("#editId").value;


      const oldPrice =
        Number(
          $("#poldprice").value ||
          0
        );


      const price =
        Number(
          $("#pprice").value ||
          0
        );


      const offerCheckbox =
        $("#poffer");


      const data = {

        name:
          $("#pname")
            .value
            .trim(),


        price:
          price,


        oldPrice:
          oldPrice,


        offer:
          offerCheckbox
            ? (
                offerCheckbox.checked &&
                oldPrice > price
              )
            : oldPrice > price,


        cat:
          $("#pcat")
            .value
            .trim(),


        desc:
          $("#pdesc")
            .value
            .trim(),


        image:
          $("#pimage")
            .value
            .trim(),


        emoji:
          $("#pemoji")
            .value
            .trim() ||
          "🛍️"

      };


      try {

        if (id) {

          await db
            .collection(
              "products"
            )
            .doc(id)
            .set(data);

        }

        else {

          await db
            .collection(
              "products"
            )
            .add(data);

        }


        e.target.reset();


        $("#editId").value =
          "";


        alert(
          "تم حفظ المنتج Online بنجاح ✅"
        );


        await loadProducts();

      }

      catch (error) {

        console.error(error);


        alert(
          "ما قدرناش نحفظو المنتج في Firebase ❌"
        );

      }

    };

}


// ===============================
// حذف المنتج
// ===============================

async function del(id) {

  if (!auth.currentUser) {

    alert(
      "خاصك تدخل لحساب الإدارة."
    );

    return;
  }


  if (
    !confirm(
      "واش متأكد بغيتي تحذف هاد المنتج؟"
    )
  ) {

    return;
  }


  try {

    await db
      .collection(
        "products"
      )
      .doc(id)
      .delete();


    delete cart[id];


    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );


    alert(
      "تم حذف المنتج ✅"
    );


    await loadProducts();

  }

  catch (error) {

    console.error(error);


    alert(
      "وقع مشكل أثناء حذف المنتج ❌"
    );

  }
}


// ===============================
// طلب مباشر عبر WhatsApp
// ===============================

function orderNow(id) {

  const p =
    products.find(
      (x) => x.id === id
    );


  if (!p) {
    return;
  }


  const message =

    "السلام عليكم، أريد طلب:%0A%0A" +

    "المنتج: " +

    encodeURIComponent(
      p.name
    ) +

    "%0A" +

    "الثمن: " +

    encodeURIComponent(
      p.price
    ) +

    " درهم";


  location.href =

    "https://wa.me/212660234149?text=" +

    message;
}


// ===============================
// إرسال السلة عبر WhatsApp
// ===============================

const orderForm =
  $("#order");


if (orderForm) {

  orderForm.onsubmit =
    (e) => {

      e.preventDefault();


      if (
        !Object.keys(cart).length
      ) {

        alert(
          "السلة فارغة"
        );

        return;
      }


      const form =
        new FormData(
          e.target
        );


      const items =

        Object.keys(cart)

          .map((id) => {

            const p =
              products.find(
                (x) => x.id === id
              );


            if (!p) {
              return "";
            }


            return (

              p.name +

              " x" +

              cart[id]

            );

          })

          .filter(Boolean)

          .join("، ");


      const message =

        "السلام عليكم، أريد الطلب:%0A" +

        encodeURIComponent(
          items
        ) +

        "%0Aالاسم: " +

        encodeURIComponent(
          form.get("name")
        ) +

        "%0Aالهاتف: " +

        encodeURIComponent(
          form.get("phone")
        ) +

        "%0Aالعنوان: " +

        encodeURIComponent(
          form.get("address")
        );


      location.href =

        "https://wa.me/212660234149?text=" +

        message;

    };
}


// ===============================
// البحث
// ===============================

const searchInput =
  $("#search");


if (searchInput) {

  searchInput.oninput =
    render;

}


const catSelect =
  $("#cat");


if (catSelect) {

  catSelect.onchange =
    render;

}


// ===============================
// Firebase Auth
// ===============================

auth.onAuthStateChanged(
  (user) => {

    if (user) {

      console.log(
        "Admin connecté:",
        user.email
      );

    }

    else {

      console.log(
        "Aucun administrateur connecté"
      );

    }

  }
);


// ===============================
// نشر المنتج في Facebook
// ===============================

function shareOnFacebook(id) {

  const p =
    products.find(
      (x) => x.id === id
    );


  if (!p) {
    return;
  }


  const storeUrl =
    "https://awani-alakhawain.github.io/Awani-alakhawain-store/";


  const text =

    "🛍️ " +

    p.name +

    "\n💰 الثمن: " +

    p.price +

    " درهم" +

    "\n\n" +

    (p.desc || "") +

    "\n\n📦 للطلب والدخول للمتجر:" +

    "\n" +

    storeUrl;


  const facebookUrl =

    "https://www.facebook.com/sharer/sharer.php?u=" +

    encodeURIComponent(
      storeUrl
    ) +

    "&quote=" +

    encodeURIComponent(
      text
    );


  window.open(
    facebookUrl,
    "_blank"
  );
}


// ===============================
// مشاركة المنتج
// ===============================

function shareProduct(id) {

  const p =
    products.find(
      (x) => x.id === id
    );


  if (!p) {
    return;
  }


  const storeUrl =
    "https://awani-alakhawain.github.io/Awani-alakhawain-store/";


  const text =

    "🛍️ " +

    p.name +

    "\n💰 الثمن: " +

    p.price +

    " درهم" +

    "\n\n" +

    (p.desc || "") +

    "\n\n📦 للطلب والدخول للمتجر:" +

    "\n" +

    storeUrl;


  if (!p.image) {

    alert(
      "هاد المنتج ما عندوش صورة."
    );

    return;
  }


  const imageUrl =
    p.image;


  window.open(
    imageUrl,
    "_blank"
  );


  setTimeout(
    () => {

      if (
        navigator.share
      ) {

        navigator.share({

          title:
            p.name,

          text:
            text,

          url:
            imageUrl

        });

      }

      else {

        alert(
          "الصورة تحلات. دابا تقدر تحفظها وتشاركها في Facebook أو Instagram أو WhatsApp."
        );

      }

    },
    500
  );
}


// ===============================
// استيراد صور GitHub
// ===============================

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
        (file) => {

          return (

            file.type ===
              "file" &&

            /\.(jpg|jpeg|png|webp|gif)$/i
              .test(file.name)

          );

        }
      );


    if (!images.length) {

      alert(
        "ما لقيتش صور جديدة فـGitHub."
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
          (p) =>
            p.image ===
            imageUrl
        );


      if (exists) {
        continue;
      }


      await db
        .collection(
          "products"
        )
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

  }

  catch (error) {

    console.error(error);


    alert(
      "وقع مشكل أثناء استيراد الصور ❌"
    );

  }
}


// ===============================
// صفحة تفاصيل المنتج
// ===============================

function openProduct(id) {

  const p =
    products.find(
      (x) => x.id === id
    );


  if (!p) {
    return;
  }


  const image =

    p.image

      ? `
        <img
          src="${p.image}"
          alt="${p.name}"
        >
      `

      : `
        <div class="pic">
          ${p.emoji || "🛍️"}
        </div>
      `;


  const offerPrice =

    Number(
      p.oldPrice || 0
    ) >

    Number(
      p.price || 0
    )

      ? `
        <div>

          <span
            style="
              text-decoration:line-through;
              color:#777;
              margin-right:10px;
            "
          >
            ${p.oldPrice} درهم
          </span>

          <strong
            style="
              color:#dc2626;
              font-size:22px;
            "
          >
            ${p.price} درهم
          </strong>

        </div>
      `

      : `
        <div class="detail-price">
          ${p.price} درهم
        </div>
      `;


  document.body.innerHTML = `

    <div class="product-detail">

      <button
        onclick="location.reload()"
      >
        ← رجوع للمنتجات
      </button>


      ${image}


      <h1>
        ${p.name}
      </h1>


      <small>
        ${p.cat}
      </small>


      ${offerPrice}


      ${
        p.desc

          ? `
            <p>
              ${p.desc}
            </p>
          `

          : ""
      }


      <button
        onclick="
          add('${p.id}')
        "
      >
        🛒 أضف للسلة
      </button>


      <button
        onclick="
          orderNow('${p.id}')
        "
      >
        🟢 أطلب الآن عبر واتساب
      </button>

    </div>

  `;
}


// ===============================
// إدارة الفئات
// ===============================

async function loadCategories() {

  if (!auth.currentUser) {
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
        .collection(
          "categories"
        )
        .get();


    const categories = [];


    snapshot.forEach(
      (doc) => {

        categories.push({

          id:
            doc.id,

          ...doc.data()

        });

      }
    );


    adminList.innerHTML =

      categories

        .map((cat) => {

          return `

            <div
              class="adminrow"
            >

              ${
                cat.image

                  ? `
                    <img
                      src="${cat.image}"
                      style="
                        width:60px;
                        height:60px;
                        object-fit:cover;
                        border-radius:10px;
                      "
                    >
                  `

                  : ""
              }


              <b>
                ${cat.name}
              </b>


              <br>


              <button
                onclick="
                  editCategory('${cat.id}')
                "
              >
                ✏️ تعديل
              </button>


              <button
                onclick="
                  deleteCategory('${cat.id}')
                "
              >
                🗑️ حذف
              </button>

            </div>

          `;

        })

        .join("")

      ||

      "<p>مازال ما كايناش فئات.</p>";

  }

  catch (error) {

    console.error(error);

    alert(
      "وقع مشكل في تحميل الفئات ❌"
    );
  }
}


// ===============================
// إضافة / تعديل فئة
// ===============================

const categoryForm =
  $("#categoryForm");


if (categoryForm) {

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


      const id =
        $("#editCategoryId").value;


      const data = {

        name:
          $("#categoryName")
            .value
            .trim(),


        image:
          $("#categoryImage")
            .value
            .trim()

      };


      if (!data.name) {

        alert(
          "دخل اسم الفئة."
        );

        return;
      }


      try {

        if (id) {

          await db
            .collection(
              "categories"
            )
            .doc(id)
            .set(data);

        }

        else {

          await db
            .collection(
              "categories"
            )
            .add(data);

        }


        e.target.reset();


        $("#editCategoryId").value =
          "";


        alert(
          "تم حفظ الفئة بنجاح ✅"
        );


        await loadCategories();

        await renderCategories();

      }

      catch (error) {

        console.error(error);


        alert(
          "ما قدرناش نحفظو الفئة ❌"
        );

      }

    };

}


// ===============================
// تعديل فئة
// ===============================

async function editCategory(id) {

  try {

    const doc =
      await db
        .collection(
          "categories"
        )
        .doc(id)
        .get();


    if (!doc.exists) {
      return;
    }


    const cat =
      doc.data();


    $("#editCategoryId").value =
      id;


    $("#categoryName").value =
      cat.name || "";


    $("#categoryImage").value =
      cat.image || "";


    openAdmin();

  }

  catch (error) {

    console.error(error);


    alert(
      "وقع مشكل أثناء تعديل الفئة ❌"
    );

  }
}


// ===============================
// حذف فئة
// ===============================

async function deleteCategory(id) {

  if (!auth.currentUser) {

    alert(
      "خاصك تدخل لحساب الإدارة."
    );

    return;
  }


  if (
    !confirm(
      "واش متأكد بغيتي تحذف هاد الفئة؟"
    )
  ) {

    return;
  }


  try {

    await db
      .collection(
        "categories"
      )
      .doc(id)
      .delete();


    alert(
      "تم حذف الفئة ✅"
    );


    await loadCategories();

    await renderCategories();

  }

  catch (error) {

    console.error(error);


    alert(
      "وقع مشكل أثناء حذف الفئة ❌"
    );

  }
}


// ===============================
// عرض الفئات للزبناء
// ===============================

async function renderCategories() {

  const container =
    $("#categories");


  if (!container) {
    return;
  }


  try {

    const snapshot =
      await db
        .collection(
          "categories"
        )
        .get();


    const categories = [];


    snapshot.forEach(
      (doc) => {

        categories.push({

          id:
            doc.id,

          ...doc.data()

        });

      }
    );


    if (!categories.length) {

      container.innerHTML =
        "";

      return;
    }


    container.innerHTML =

      categories

        .map((cat) => {

          const image =

            cat.image

              ? `
                <img
                  src="${cat.image}"
                  alt="${cat.name}"
                >
              `

              : `
                <div
                  class="category-placeholder"
                >
                  🛍️
                </div>
              `;


          return `

            <div
              class="category-card"
              onclick="
                selectCategory(
                  '${cat.name}'
                )
              "
            >

              ${image}

              <h3>
                ${cat.name}
              </h3>

            </div>

          `;

        })

        .join("");

  }

  catch (error) {

    console.error(error);

    container.innerHTML =
      "";

  }
}


// ===============================
// اختيار فئة
// ===============================

function selectCategory(
  categoryName
) {

  const catSelect =
    $("#cat");


  if (!catSelect) {
    return;
  }


  catSelect.value =
    categoryName;


  render();


  const productsElement =
    document.querySelector(
      "#products"
    );


  if (productsElement) {

    window.scrollTo({

      top:
        productsElement.offsetTop -
        20,

      behavior:
        "smooth"

    });

  }
}


// ===============================
// تشغيل المتجر
// ===============================

loadProducts();
