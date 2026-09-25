
/* =========================================================
   🏠 AWANI EL AKHAWAIN
   Application JavaScript
   ========================================================= */

const starter = [
  {
    id: "starter-1",
    name: "إبريق أنوكس",
    price: 100,
    oldPrice: 0,
    offer: "",
    category: "أباريق",
    desc: "إبريق أنوكس بجودة جيدة للاستعمال اليومي.",
    image: ""
  },
  {
    id: "starter-2",
    name: "طقم أواني الطبخ",
    price: 249,
    oldPrice: 0,
    offer: "",
    category: "أواني الطبخ",
    desc: "طقم عملي وأنيق للمطبخ.",
    image: ""
  },
  {
    id: "starter-3",
    name: "كاسرولة أنوكس",
    price: 120,
    oldPrice: 0,
    offer: "",
    category: "أواني الطبخ",
    desc: "كاسرولة أنوكس للاستعمال اليومي.",
    image: ""
  },
  {
    id: "starter-4",
    name: "صينية تقديم",
    price: 80,
    oldPrice: 0,
    offer: "",
    category: "تقديم",
    desc: "صينية أنيقة للتقديم.",
    image: ""
  }
];

let products = [];
let categories = [];
let cart = JSON.parse(localStorage.getItem("awaniCart") || "{}");

const WHATSAPP = "212660234149";

function $(id) {
  return document.getElementById(id);
}

/* =========================================================
   🔔 TOAST
   ========================================================= */

function showToast(message) {

  let toast = document.getElementById("awani-toast");

  if (!toast) {

    toast = document.createElement("div");
    toast.id = "awani-toast";

    toast.style.cssText = `
      position:fixed;
      left:50%;
      bottom:25px;
      transform:translateX(-50%);
      background:#111;
      color:white;
      padding:13px 20px;
      border-radius:30px;
      z-index:99999;
      font-size:15px;
      box-shadow:0 8px 30px rgba(0,0,0,.25);
    `;

    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = "block";

  clearTimeout(window.awaniToastTimer);

  window.awaniToastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

/* =========================================================
   💰 SHIPPING
   ========================================================= */

function getShipping(count) {

  if (count <= 0) return 0;

  if (count === 1) return 30;

  if (count === 2) return 15;

  return 0;
}

/* =========================================================
   🛒 CART COUNT
   ========================================================= */

function getCartCount() {

  return Object.values(cart).reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );
}

/* =========================================================
   📦 LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

  try {

    const snapshot = await db
      .collection("products")
      .get();

    products = [];

    snapshot.forEach(doc => {

      const data = doc.data();

      products.push({
        id: doc.id,
        name: data.name || "منتج",
        price: Number(data.price || 0),
        oldPrice: Number(data.oldPrice || 0),
        offer: data.offer || "",
        category: data.category || "أخرى",
        desc: data.desc || data.description || "",
        image: data.image || "",
        emoji: data.emoji || "🛍️"
      });

    });

    if (products.length === 0) {
      products = starter;
    }

  } catch (error) {

    console.error("Firebase products error:", error);

    products = starter;

    showToast("تعذر تحميل المنتجات من Firebase");

  }

  renderCategories();
  render();
  renderAdmin();

}

/* =========================================================
   🏷️ LOAD CATEGORIES
   ========================================================= */

async function loadCategories() {

  try {

    const snapshot = await db
      .collection("categories")
      .get();

    categories = [];

    snapshot.forEach(doc => {

      const data = doc.data();

      categories.push({
        id: doc.id,
        name: data.name || "",
        image: data.image || ""
      });

    });

  } catch (error) {

    console.error("Categories error:", error);

    categories = [];
  }

  renderCategories();
}

/* =========================================================
   🏷️ RENDER CATEGORIES
   ========================================================= */

function renderCategories() {

  const select = $("cat");

  if (select) {

    const current = select.value;

    select.innerHTML = `
      <option value="">جميع الفئات</option>
    `;

    const names = new Set();

    categories.forEach(cat => {

      if (cat.name) {
        names.add(cat.name);
      }

    });

    products.forEach(product => {

      if (product.category) {
        names.add(product.category);
      }

    });

    [...names].forEach(name => {

      const option = document.createElement("option");

      option.value = name;
      option.textContent = name;

      select.appendChild(option);

    });

    select.value = current;
  }

  const adminSelect = $("adminProductCategory");

  if (adminSelect) {

    const current = adminSelect.value;

    adminSelect.innerHTML = `
      <option value="">جميع الفئات</option>
    `;

    const names = new Set();

    categories.forEach(cat => {
      if (cat.name) names.add(cat.name);
    });

    products.forEach(product => {
      if (product.category) names.add(product.category);
    });

    [...names].forEach(name => {

      const option = document.createElement("option");

      option.value = name;
      option.textContent = name;

      adminSelect.appendChild(option);

    });

    adminSelect.value = current;
  }
}

/* =========================================================
   🛍️ RENDER PRODUCTS
   ========================================================= */

function render() {

  const container = $("products");

  if (!container) return;

  const search = ($("search")?.value || "")
    .trim()
    .toLowerCase();

  const category = $("cat")?.value || "";

  const filtered = products.filter(product => {

    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    const matchesCategory =
      !category ||
      product.category === category;

    return matchesSearch && matchesCategory;

  });

  if (filtered.length === 0) {

    container.innerHTML = `
      <div style="
        width:100%;
        text-align:center;
        padding:40px 10px;
        color:#777;
      ">
        لا توجد منتجات حالياً
      </div>
    `;

    return;
  }

  container.innerHTML = filtered.map(product => {

    const image = product.image
      ? `
        <img
          src="${product.image}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
        >
        <div class="product-fallback">
          ${product.emoji || "🛍️"}
        </div>
      `
      : `
        <div class="product-fallback">
          ${product.emoji || "🛍️"}
        </div>
      `;

    const oldPrice = product.oldPrice > product.price
      ? `<span class="old-price">${product.oldPrice} DH</span>`
      : "";

    const offer = product.offer
      ? `<span class="offer-badge">${escapeHtml(product.offer)}</span>`
      : "";

    return `
      <article
        class="product-card"
        onclick="openProduct('${product.id}')"
      >

        <div class="product-image">

          ${offer}

          ${image}

        </div>

        <div class="product-info">

          <div class="product-category">
            ${escapeHtml(product.category || "")}
          </div>

          <h3>
            ${escapeHtml(product.name)}
          </h3>

          <p class="product-desc">
            ${escapeHtml(product.desc || "")}
          </p>

          <div class="price-box">

            <strong>
              ${product.price} DH
            </strong>

            ${oldPrice}

          </div>

          <button
            class="add-btn"
            onclick="event.stopPropagation(); add('${product.id}')"
          >
            🛒 أضف للسلة
          </button>

          <button
            class="whatsapp-btn"
            onclick="event.stopPropagation(); orderNow('${product.id}')"
          >
            📱 أطلب الآن عبر واتساب
          </button>

        </div>

      </article>
    `;

  }).join("");

  renderCart();
}

/* =========================================================
   🧼 ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   🔎 PRODUCT DETAILS
   ========================================================= */

function openProduct(id) {

  const product = products.find(p => p.id === id);

  if (!product) return;

  const oldPrice =
    product.oldPrice > product.price
      ? `
        <span style="
          text-decoration:line-through;
          color:#999;
          margin-right:10px;
        ">
          ${product.oldPrice} DH
        </span>
      `
      : "";

  const modal = document.createElement("div");

  modal.id = "product-modal";

  modal.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.75);
    z-index:99990;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:15px;
  `;

  modal.innerHTML = `

    <div style="
      background:white;
      width:min(500px,100%);
      max-height:90vh;
      overflow:auto;
      border-radius:22px;
      padding:20px;
      position:relative;
    ">

      <button
        onclick="document.getElementById('product-modal').remove()"
        style="
          position:absolute;
          top:10px;
          right:10px;
          width:38px;
          height:38px;
          border:0;
          border-radius:50%;
          background:#111;
          color:white;
          font-size:20px;
          cursor:pointer;
        "
      >
        ×
      </button>

      <div style="
        background:#f5f5f5;
        border-radius:18px;
        padding:15px;
        text-align:center;
      ">

        ${
          product.image
          ? `
            <img
              src="${product.image}"
              style="
                width:100%;
                max-height:350px;
                object-fit:contain;
              "
            >
          `
          : `
            <div style="
              font-size:100px;
              padding:50px;
            ">
              ${product.emoji || "🛍️"}
            </div>
          `
        }

      </div>

      <h2>
        ${escapeHtml(product.name)}
      </h2>

      <p style="color:#777;">
        ${escapeHtml(product.category || "")}
      </p>

      <p>
        ${escapeHtml(product.desc || "منتج بجودة جيدة")}
      </p>

      <div style="
        font-size:24px;
        font-weight:bold;
        margin:15px 0;
      ">

        ${product.price} DH

        ${oldPrice}

      </div>

      <button
        onclick="add('${product.id}')"
        style="
          width:100%;
          padding:14px;
          border:0;
          border-radius:12px;
          background:#111;
          color:white;
          font-size:17px;
          cursor:pointer;
        "
      >
        🛒 أضف للسلة
      </button>

    </div>
  `;

  document.body.appendChild(modal);
}

/* =========================================================
   🛒 ADD TO CART
   ========================================================= */

function add(id) {

  const product = products.find(p => p.id === id);

  if (!product) return;

  if (!cart[id]) {

    cart[id] = {
      qty: 0
    };

  }

  cart[id].qty++;

  localStorage.setItem(
    "awaniCart",
    JSON.stringify(cart)
  );

  renderCart();

  showToast(
    `تمت إضافة ${product.name} للسلة 🛒`
  );

  playCartSound();

}

/* =========================================================
   ➕➖ CHANGE QUANTITY
   ========================================================= */

function chg(id, amount) {

  if (!cart[id]) return;

  cart[id].qty += amount;

  if (cart[id].qty <= 0) {

    delete cart[id];

  }

  localStorage.setItem(
    "awaniCart",
    JSON.stringify(cart)
  );

  renderCart();
}

/* =========================================================
   🧹 CLEAR CART
   ========================================================= */

function clearCart() {

  cart = {};

  localStorage.removeItem("awaniCart");

  renderCart();

  showToast("تم إفراغ السلة");
}

/* =========================================================
   🛒 RENDER CART
   ========================================================= */

function renderCart() {

  const items = $("items");

  if (!items) return;

  const entries = Object.entries(cart);

  let subtotal = 0;

  if (entries.length === 0) {

    items.innerHTML = `
      <div style="
        text-align:center;
        padding:25px;
        color:#777;
      ">
        🛒 السلة فارغة
      </div>
    `;

  } else {

    items.innerHTML = entries.map(([id, item]) => {

      const product =
        products.find(p => p.id === id);

      if (!product) return "";

      const total =
        product.price * item.qty;

      subtotal += total;

      return `
        <div style="
          display:flex;
          gap:10px;
          align-items:center;
          padding:12px 0;
          border-bottom:1px solid #eee;
        ">

          <div style="
            width:55px;
            height:55px;
            background:#f5f5f5;
            border-radius:10px;
            display:flex;
            align-items:center;
            justify-content:center;
            overflow:hidden;
          ">

            ${
              product.image
              ? `
                <img
                  src="${product.image}"
                  style="
                    width:100%;
                    height:100%;
                    object-fit:contain;
                  "
                >
              `
              : "🛍️"
            }

          </div>

          <div style="flex:1">

            <strong>
              ${escapeHtml(product.name)}
            </strong>

            <div style="font-size:14px;color:#777;">
              ${product.price} DH
            </div>

            <div style="
              display:flex;
              align-items:center;
              gap:8px;
              margin-top:6px;
            ">

              <button
                onclick="chg('${id}',-1)"
                style="
                  width:28px;
                  height:28px;
                  border:1px solid #ddd;
                  border-radius:50%;
                  background:white;
                "
              >
                −
              </button>

              <span>
                ${item.qty}
              </span>

              <button
                onclick="chg('${id}',1)"
                style="
                  width:28px;
                  height:28px;
                  border:1px solid #ddd;
                  border-radius:50%;
                  background:white;
                "
              >
                +
              </button>

            </div>

          </div>

          <strong>
            ${total} DH
          </strong>

        </div>
      `;

    }).join("");

  }

  const count = getCartCount();

  const shipping = getShipping(count);

  const total =
    subtotal + shipping;

  if ($("total")) {

    $("total").innerHTML = `
      <div style="
        display:flex;
        justify-content:space-between;
      ">
        <span>المجموع:</span>
        <strong>${subtotal} DH</strong>
      </div>

      <div style="
        display:flex;
        justify-content:space-between;
        margin-top:7px;
      ">
        <span>التوصيل:</span>
        <strong>
          ${
            shipping === 0 && count >= 3
            ? "مجاني 🎉"
            : shipping + " DH"
          }
        </strong>
      </div>

      <hr>

      <div style="
        display:flex;
        justify-content:space-between;
        font-size:20px;
      ">
        <span>الإجمالي:</span>
        <strong>${total} DH</strong>
      </div>
    `;

  }

  const floating =
    $("floating-cart");

  if (floating) {

    floating.innerHTML = `
      🛒
      <span style="
        position:absolute;
        top:-6px;
        right:-6px;
        background:#e53935;
        color:white;
        width:22px;
        height:22px;
        border-radius:50%;
        font-size:12px;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        ${count}
      </span>
    `;

  }

}

/* =========================================================
   🛒 OPEN / CLOSE CART
   ========================================================= */

function openCart() {

  const cartBox = $("cart");

  if (cartBox) {

    cartBox.style.display = "block";

  }
}

function closeCart() {

  const cartBox = $("cart");

  if (cartBox) {

    cartBox.style.display = "none";

  }
}

/* =========================================================
   📱 WHATSAPP PRODUCT ORDER
   ========================================================= */

function orderNow(id) {

  const product =
    products.find(p => p.id === id);

  if (!product) return;

  const message =
    `السلام عليكم، بغيت نطلب:\n\n` +
    `🛍️ المنتج: ${product.name}\n` +
    `💰 الثمن: ${product.price} DH`;

  const url =
    `https://wa.me/${WHATSAPP}?text=` +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

/* =========================================================
   📝 ORDER FORM
   ========================================================= */

function setupOrderForm() {

  const form = $("order");

  if (!form) return;

  form.addEventListener("submit", function(e) {

    e.preventDefault();

    const name =
      $("customerName")?.value.trim() || "";

    const phone =
      $("customerPhone")?.value.trim() || "";

    const city =
      $("customerCity")?.value.trim() || "";

    const address =
      $("customerAddress")?.value.trim() || "";

    const entries =
      Object.entries(cart);

    if (entries.length === 0) {

      showToast("السلة فارغة");

      return;
    }

    let message =
      `السلام عليكم، بغيت نأكد الطلب ديالي:\n\n`;

    let subtotal = 0;

    entries.forEach(([id, item]) => {

      const product =
        products.find(p => p.id === id);

      if (!product) return;

      const line =
        product.price * item.qty;

      subtotal += line;

      message +=
        `🛍️ ${product.name}\n` +
        `الكمية: ${item.qty}\n` +
        `الثمن: ${line} DH\n\n`;

    });

    const shipping =
      getShipping(getCartCount());

    const total =
      subtotal + shipping;

    message +=
      `🚚 التوصيل: ${
        shipping === 0
        ? "مجاني"
        : shipping + " DH"
      }\n` +
      `💰 المجموع: ${total} DH\n\n` +
      `👤 الاسم: ${name}\n` +
      `📞 الهاتف: ${phone}\n` +
      `📍 المدينة: ${city}\n` +
      `🏠 العنوان: ${address}`;

    const url =
      `https://wa.me/${WHATSAPP}?text=` +
      encodeURIComponent(message);

    window.open(url, "_blank");

  });
}

/* =========================================================
   🔎 SEARCH
   ========================================================= */

function setupSearch() {

  const search = $("search");

  if (search) {

    search.addEventListener(
      "input",
      render
    );

  }

  const cat = $("cat");

  if (cat) {

    cat.addEventListener(
      "change",
      render
    );

  }

}

/* =========================================================
   🔊 CART SOUND
   ========================================================= */

function playCartSound() {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const ctx = new AudioContext();

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    oscillator.frequency.value = 700;

    oscillator.type = "sine";

    gain.gain.setValueAtTime(
      0.08,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.15
    );

    oscillator.connect(gain);

    gain.connect(ctx.destination);

    oscillator.start();

    oscillator.stop(
      ctx.currentTime + 0.15
    );

  } catch (e) {}

}

/* =========================================================
   👤 LOGIN
   ========================================================= */

function setupLogin() {

  const form = $("loginForm");

  if (!form) return;

  form.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email =
      $("email")?.value.trim();

    const password =
      $("password")?.value;

    if (!email || !password) {

      showToast("دخل الإيميل وكلمة السر");

      return;
    }

    try {

      await auth.signInWithEmailAndPassword(
        email,
        password
      );

      showToast(
        "تم تسجيل الدخول بنجاح"
      );

    } catch (error) {

      console.error(error);

      showToast(
        "معلومات الدخول غير صحيحة"
      );

    }

  });
}

/* =========================================================
   🚪 LOGOUT
   ========================================================= */

async function logout() {

  try {

    await auth.signOut();

    showToast(
      "تم تسجيل الخروج"
    );

  } catch (error) {

    console.error(error);

  }
}

/* =========================================================
   🧑‍💼 ADMIN
   ========================================================= */

function renderAdmin() {

  const admin =
    $("admin");

  if (!admin) return;

  const user =
    auth.currentUser;

  if (!user) {

    admin.style.display = "none";

    return;
  }

  admin.style.display = "block";

  renderAdminProducts();
  renderAdminCategories();

}

/* =========================================================
   🛍️ ADMIN PRODUCTS
   ========================================================= */

function renderAdminProducts() {

  const list =
    $("adminList");

  if (!list) return;

  const search =
    ($("adminProductSearch")?.value || "")
      .toLowerCase();

  const category =
    $("adminProductCategory")?.value || "";

  const filtered =
    products.filter(product => {

      const matchSearch =
        !search ||
        product.name
          .toLowerCase()
          .includes(search);

      const matchCategory =
        !category ||
        product.category === category;

      return matchSearch && matchCategory;

    });

  list.innerHTML =
    filtered.map(product => `

      <div style="
        display:flex;
        gap:10px;
        align-items:center;
        padding:12px;
        border-bottom:1px solid #eee;
      ">

        <div style="
          width:60px;
          height:60px;
          background:#f5f5f5;
          border-radius:10px;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
        ">

          ${
            product.image
            ? `
              <img
                src="${product.image}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:contain;
                "
              >
            `
            : "🛍️"
          }

        </div>

        <div style="flex:1">

          <strong>
            ${escapeHtml(product.name)}
          </strong>

          <div>
            ${product.price} DH
          </div>

        </div>

        <button
          onclick="editProduct('${product.id}')"
        >
          تعديل
        </button>

        <button
          onclick="deleteProduct('${product.id}')"
        >
          حذف
        </button>

      </div>

    `).join("");

}

/* =========================================================
   ➕ ADD PRODUCT
   ========================================================= */

function setupProductForm() {

  const form =
    $("productForm");

  if (!form) return;

  form.addEventListener("submit", async function(e) {

    e.preventDefault();

    const editId =
      $("editId")?.value || "";

    const product = {

      name:
        $("pname")?.value.trim() || "",

      price:
        Number($("pprice")?.value || 0),

      oldPrice:
        Number($("poldprice")?.value || 0),

      offer:
        $("poffer")?.value.trim() || "",

      category:
        $("pcat")?.value.trim() || "أخرى",

      desc:
        $("pdesc")?.value.trim() || "",

      image:
        $("pimage")?.value.trim() || "",

      emoji:
        $("pemoji")?.value.trim() || "🛍️"

    };

    if (!product.name) {

      showToast("دخل اسم المنتج");

      return;
    }

    try {

      if (editId) {

        await db
          .collection("products")
          .doc(editId)
          .update(product);

        showToast(
          "تم تعديل المنتج"
        );

      } else {

        await db
          .collection("products")
          .add(product);

        showToast(
          "تمت إضافة المنتج"
        );

      }

      form.reset();

      if ($("editId")) {
        $("editId").value = "";
      }

      await loadProducts();

    } catch (error) {

      console.error(error);

      showToast(
        "وقع مشكل في حفظ المنتج"
      );

    }

  });

}

/* =========================================================
   ✏️ EDIT PRODUCT
   ========================================================= */

function editProduct(id) {

  const product =
    products.find(p => p.id === id);

  if (!product) return;

  if ($("editId"))
    $("editId").value = id;

  if ($("pname"))
    $("pname").value = product.name;

  if ($("pprice"))
    $("pprice").value = product.price;

  if ($("poldprice"))
    $("poldprice").value =
      product.oldPrice || "";

  if ($("poffer"))
    $("poffer").value =
      product.offer || "";

  if ($("pcat"))
    $("pcat").value =
      product.category || "";

  if ($("pdesc"))
    $("pdesc").value =
      product.desc || "";

  if ($("pimage"))
    $("pimage").value =
      product.image || "";

  if ($("pemoji"))
    $("pemoji").value =
      product.emoji || "";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

/* =========================================================
   🗑️ DELETE PRODUCT
   ========================================================= */

async function deleteProduct(id) {

  if (!confirm(
    "واش متأكد بغيتي تحيد هاد المنتج؟"
  )) return;

  try {

    await db
      .collection("products")
      .doc(id)
      .delete();

    delete cart[id];

    localStorage.setItem(
      "awaniCart",
      JSON.stringify(cart)
    );

    showToast(
      "تم حذف المنتج"
    );

    await loadProducts();

  } catch (error) {

    console.error(error);

    showToast(
      "وقع مشكل في حذف المنتج"
    );

  }

}

/* =========================================================
   🏷️ ADMIN CATEGORIES
   ========================================================= */

function renderAdminCategories() {

  const list =
    $("categoryAdminList");

  if (!list) return;

  list.innerHTML =
    categories.map(cat => `

      <div style="
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px;
        border-bottom:1px solid #eee;
      ">

        <div style="flex:1">
          ${escapeHtml(cat.name)}
        </div>

        <button
          onclick="editCategory('${cat.id}')"
        >
          تعديل
        </button>

        <button
          onclick="deleteCategory('${cat.id}')"
        >
          حذف
        </button>

      </div>

    `).join("");

}

/* =========================================================
   ➕ CATEGORY FORM
   ========================================================= */

function setupCategoryForm() {

  const form =
    $("categoryForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();

      const editId =
        $("editCategoryId")?.value || "";

      const name =
        $("categoryName")?.value.trim() || "";

      const image =
        $("categoryImage")?.value.trim() || "";

      if (!name) {

        showToast(
          "دخل اسم الفئة"
        );

        return;
      }

      try {

        if (editId) {

          await db
            .collection("categories")
            .doc(editId)
            .update({
              name,
              image
            });

        } else {

          await db
            .collection("categories")
            .add({
              name,
              image
            });

        }

        form.reset();

        if ($("editCategoryId")) {
          $("editCategoryId").value = "";
        }

        await loadCategories();

        renderAdmin();

        showToast(
          "تم حفظ الفئة"
        );

      } catch (error) {

        console.error(error);

        showToast(
          "وقع مشكل في حفظ الفئة"
        );

      }

    }
  );

}

/* =========================================================
   ✏️ EDIT CATEGORY
   ========================================================= */

function editCategory(id) {

  const category =
    categories.find(c => c.id === id);

  if (!category) return;

  if ($("editCategoryId"))
    $("editCategoryId").value = id;

  if ($("categoryName"))
    $("categoryName").value =
      category.name;

  if ($("categoryImage"))
    $("categoryImage").value =
      category.image || "";

}

/* =========================================================
   🗑️ DELETE CATEGORY
   ========================================================= */

async function deleteCategory(id) {

  if (!confirm(
    "واش متأكد بغيتي تحيد هاد الفئة؟"
  )) return;

  try {

    await db
      .collection("categories")
      .doc(id)
      .delete();

    await loadCategories();

    renderAdmin();

    showToast(
      "تم حذف الفئة"
    );

  } catch (error) {

    console.error(error);

    showToast(
      "وقع مشكل في حذف الفئة"
    );

  }

}

/* =========================================================
   🔍 ADMIN SEARCH
   ========================================================= */

function setupAdminSearch() {

  const search =
    $("adminProductSearch");

  if (search) {

    search.addEventListener(
      "input",
      renderAdminProducts
    );

  }

  const category =
    $("adminProductCategory");

  if (category) {

    category.addEventListener(
      "change",
      renderAdminProducts
    );

  }

}

/* =========================================================
   🛒 FLOATING CART
   ========================================================= */

function setupFloatingCart() {

  const button =
    $("floating-cart");

  if (!button) return;

  button.style.position = "fixed";
  button.style.zIndex = "9998";
  button.style.cursor = "pointer";

  button.onclick = function() {

    openCart();

  };

}

/* =========================================================
   🚀 START
   ========================================================= */

async function startAwaniStore() {

  setupSearch();

  setupOrderForm();

  setupLogin();

  setupProductForm();

  setupCategoryForm();

  setupAdminSearch();

  setupFloatingCart();

  await loadCategories();

  await loadProducts();

  if (typeof renderAdmin === "function") {
    renderAdmin();
  }

}

/* =========================================================
   🔐 AUTH STATE
   ========================================================= */

if (typeof auth !== "undefined") {

  auth.onAuthStateChanged(user => {

    if (user) {

      console.log(
        "👤 تم تسجيل الدخول للإدارة."
      );

      renderAdmin();

      loadCategories();

    } else {

      console.log(
        "👤 لا يوجد حساب إدارة مسجل."
      );

      const admin =
        $("admin");

      if (admin) {
        admin.style.display = "none";
      }

    }

  });

}

/* =========================================================
   ▶️ START APP
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  startAwaniStore
);
