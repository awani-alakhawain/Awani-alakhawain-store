const starter = [
  {
    id: "starter1",
    name: "إبريق أنوكس",
    price: 100,
    cat: "أباريق",
    emoji: "🫖",
    desc: "إبريق أنوكس بجودة جيدة.",
    image: ""
  },
  {
    id: "starter2",
    name: "طقم أواني الطبخ",
    price: 249,
    cat: "أواني الطبخ",
    emoji: "🍳",
    desc: "طقم عملي للمطبخ.",
    image: ""
  },
  {
    id: "starter3",
    name: "كاسرولة أنوكس",
    price: 120,
    cat: "أواني الطبخ",
    emoji: "🥘",
    desc: "كاسرولة أنوكس للاستعمال اليومي.",
    image: ""
  },
  {
    id: "starter4",
    name: "صينية تقديم",
    price: 80,
    cat: "أواني منزلية",
    emoji: "🍽️",
    desc: "صينية أنيقة للتقديم.",
    image: ""
  }
];

let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "{}");

const $ = (s) => document.querySelector(s);

/* =========================
   FIREBASE - تحميل المنتجات
========================= */

async function loadProducts() {
  try {
    const snapshot = await db.collection("products").get();

    products = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      products.push({
        id: doc.id,
        name: data.name || "",
        price: Number(data.price || 0),
        cat: data.cat || "أخرى",
        emoji: data.emoji || "🛍️",
        desc: data.desc || "",
        image: data.image || ""
      });
    });

    /*
      إذا كانت Collection خاوية،
      نستعمل المنتجات التجريبية فقط للعرض.
    */
    if (products.length === 0) {
      products = starter;
    }

    render();
    renderAdmin();

  } catch (error) {
    console.error(error);

    products = starter;

    render();
    renderAdmin();

    alert("وقع مشكل في الاتصال بـ Firebase.");
  }
}

/* =========================
   عرض المنتجات
========================= */

function render() {

  const searchInput = $("#search");
  const catSelect = $("#cat");

  if (!searchInput || !catSelect) return;

  const q = searchInput.value.toLowerCase();
  const c = catSelect.value;

  const cats = [...new Set(products.map((p) => p.cat))];

  catSelect.innerHTML =
    '<option value="">كل الفئات</option>' +
    cats.map((x) =>
      `<option value="${x}" ${x === c ? "selected" : ""}>${x}</option>`
    ).join("");

  const filtered = products.filter((p) => {

    const searchOK =
      !q || p.name.toLowerCase().includes(q);

    const catOK =
      !c || p.cat === c;

    return searchOK && catOK;
  });

  $("#products").innerHTML =
    filtered.map((p) => {

      const picture = p.image
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

      return `
        <article class="card">

          ${picture}

          <div class="body">

            <h3>${p.name}</h3>

            <small>${p.cat}</small>

            ${
              p.desc
                ? `<p>${p.desc}</p>`
                : ""
            }

            <div class="price">
              ${p.price} درهم
            </div>

            <button
              class="add"
              onclick="add('${p.id}')">
              🛒 أضف للسلة
            </button>

            <button
              onclick="orderNow('${p.id}')"
              style="
                margin-top:8px;
                width:100%;
              ">
              🟢 أطلب الآن عبر واتساب
            </button>

          </div>

        </article>
      `;

    }).join("") || "<p>لا توجد منتجات.</p>";

  renderCart();
}

/* =========================
   السلة
========================= */

function renderCart() {

  let count = 0;
  let total = 0;

  const html = Object.keys(cart)
    .map((id) => {

      const p = products.find(
        (x) => x.id === id
      );

      if (!p) return "";

      const quantity = cart[id];

      count += quantity;
      total += p.price * quantity;

      return `
        <div class="row">

          <span>
            ${p.name}<br>
            ${p.price} × ${quantity}
          </span>

          <span>
            <button onclick="chg('${id}', -1)">−</button>
            ${quantity}
            <button onclick="chg('${id}', 1)">+</button>
          </span>

        </div>
      `;
    })
    .join("");

  $("#items").innerHTML =
    html || "<p>السلة فارغة.</p>";

  $("#count").textContent = count;
  $("#total").textContent = total;
}

/* =========================
   إضافة للسلة
========================= */

function add(id) {

  cart[id] = (cart[id] || 0) + 1;

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  renderCart();
  openCart();
}

/* =========================
   تغيير الكمية
========================= */

function chg(id, amount) {

  cart[id] = (cart[id] || 0) + amount;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  renderCart();
}

/* =========================
   السلة
========================= */

function openCart() {
  $("#cart").classList.add("open");
}

function closeCart() {
  $("#cart").classList.remove("open");
}

/* =========================
   تسجيل الدخول
========================= */

function openLogin() {

  /*
    إذا كان Admin داخل من قبل،
    نفتحو الإدارة مباشرة.
  */
  if (auth.currentUser) {
    alert("وصلنا لـ openAdmin ✅");
openAdmin();
    return;
  }

  $("#login").classList.add("open");
}

function closeLogin() {
  $("#login").classList.remove("open");
}

$("#loginForm").onsubmit = async (e) => {

  e.preventDefault();

  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;

  const message = $("#loginMessage");

  message.textContent = "جاري تسجيل الدخول...";

  try {

    await auth.signInWithEmailAndPassword(
      email,
      password
    );

    message.textContent =
      "تم الدخول بنجاح ✅";

    closeLogin();
    openAdmin();

  } catch (error) {

    console.error(error);

    message.textContent =
      "الإيميل أو كلمة السر غير صحيحة ❌";
  }
};

/* =========================
   إدارة المتجر
========================= */

function openAdmin() {

  if (!auth.currentUser) {
    openLogin();
    return;
  }

  $("#admin").classList.add("open");

  renderAdmin();
}

function closeAdmin() {
  $("#admin").classList.remove("open");
}

/* =========================
   قائمة الإدارة
========================= */

function renderAdmin() {

  if (!auth.currentUser) {
    $("#adminList").innerHTML = "";
    return;
  }

  /*
    ما نظهروش starter داخل الإدارة
    لأنها ماشي محفوظة في Firebase.
  */

  $("#adminList").innerHTML =
    products.map((p) => {

      return `
        <div class="adminrow">

          <b>${p.name}</b>
          — ${p.price}dh

          <br>

          <small>${p.cat}</small>

          <br>

          <button
            onclick="edit('${p.id}')">
            ✏️ تعديل
          </button>

          <button
            onclick="del('${p.id}')">
            🗑️ حذف
          </button>
          <button
  onclick="shareOnFacebook('${p.id}')">
  📘 نشر في Facebook
</button>
<button
  onclick="shareProduct('${p.id}')">
  📢 مشاركة المنتج
</button>

        </div>
      `;

    }).join("");
}

/* =========================
   تعديل منتج
========================= */

function edit(id) {
  
alert("زر التعديل خدام ✅");
  const p = products.find(
    (x) => x.id === id
  );

  if (!p) return;

  $("#editId").value = p.id;
  $("#pname").value = p.name;
  $("#pprice").value = p.price;
  $("#pcat").value = p.cat;
  $("#pdesc").value = p.desc || "";
  $("#pimage").value = p.image || "";
  $("#pemoji").value = p.emoji || "";

  openAdmin();
}

/* =========================
   إضافة / تعديل المنتج
========================= */

$("#productForm").onsubmit = async (e) => {

  e.preventDefault();

  if (!auth.currentUser) {

    alert("خاصك تدخل لحساب الإدارة أولاً.");

    openLogin();

    return;
  }

  const id = $("#editId").value;

  const data = {

    name: $("#pname").value.trim(),

    price: Number(
      $("#pprice").value
    ),

    cat: $("#pcat").value.trim(),

    desc: $("#pdesc").value.trim(),

    image: $("#pimage").value.trim(),

    emoji:
      $("#pemoji").value.trim() ||
      "🛍️"

  };

  try {

    if (id) {

      await db
        .collection("products")
        .doc(id)
        .set(data);

    } else {

      await db
        .collection("products")
        .add(data);

    }

    e.target.reset();

    $("#editId").value = "";

    alert(
      "تم حفظ المنتج Online بنجاح ✅"
    );

    await loadProducts();

  } catch (error) {

    console.error(error);

    alert(
      "ما قدرناش نحفظو المنتج في Firebase ❌"
    );
  }
};

/* =========================
   حذف المنتج
========================= */

async function del(id) {

  if (!auth.currentUser) {

    alert(
      "خاصك تدخل لحساب الإدارة."
    );

    return;
  }

  if (!confirm("واش متأكد بغيتي تحذف هاد المنتج؟")) {
    return;
  }

  try {

    await db
      .collection("products")
      .doc(id)
      .delete();

    delete cart[id];

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    alert("تم حذف المنتج ✅");

    await loadProducts();

  } catch (error) {

    console.error(error);

    alert(
      "وقع مشكل أثناء حذف المنتج ❌"
    );
  }
}

/* =========================
   طلب مباشر عبر WhatsApp
========================= */

function orderNow(id) {

  const p = products.find(
    (x) => x.id === id
  );

  if (!p) return;

  const message =
    "السلام عليكم، أريد طلب:%0A%0A" +
    "المنتج: " +
    encodeURIComponent(p.name) +
    "%0A" +
    "الثمن: " +
    encodeURIComponent(p.price) +
    " درهم";

  location.href =
    "https://wa.me/212660234149?text=" +
    message;
}

/* =========================
   إرسال السلة عبر WhatsApp
========================= */

$("#order").onsubmit = (e) => {

  e.preventDefault();

  if (!Object.keys(cart).length) {

    alert("السلة فارغة");

    return;
  }

  const form = new FormData(e.target);

  const items = Object.keys(cart)
    .map((id) => {

      const p = products.find(
        (x) => x.id === id
      );

      return (
        p.name +
        " x" +
        cart[id]
      );
    })
    .join("، ");

  const message =
    "السلام عليكم، أريد الطلب:%0A" +
    encodeURIComponent(items) +
    "%0Aالاسم: " +
    encodeURIComponent(form.get("name")) +
    "%0Aالهاتف: " +
    encodeURIComponent(form.get("phone")) +
    "%0Aالعنوان: " +
    encodeURIComponent(form.get("address"));

  location.href =
    "https://wa.me/212660234149?text=" +
    message;
};

/* =========================
   البحث
========================= */

$("#search").oninput = render;

$("#cat").onchange = render;

/* =========================
   Firebase Auth
========================= */

auth.onAuthStateChanged((user) => {

  if (user) {

    console.log(
      "Admin connecté:",
      user.email
    );

  } else {

    console.log(
      "Aucun administrateur connecté"
    );
  }

});
/* =========================
   نشر المنتج في Facebook
========================= */

function shareOnFacebook(id) {

  const p = products.find(
    (x) => x.id === id
  );

  if (!p) return;

  const storeUrl =
    "https://awani-alakhawain.github.io/Awani-alakhawain-store/";

  const text =
    "🛍️ " + p.name +
    "\n💰 الثمن: " + p.price + " درهم" +
    "\n\n" + (p.desc || "") +
    "\n\n📦 للطلب والدخول للمتجر:" +
    "\n" + storeUrl;

  const facebookUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(storeUrl) +
    "&quote=" +
    encodeURIComponent(text);

  window.open(
    facebookUrl,
    "_blank"
  );
}
function shareProduct(id) {

  const p = products.find(
    (x) => x.id === id
  );

  if (!p) return;

  const storeUrl =
    "https://awani-alakhawain.github.io/Awani-alakhawain-store/";

  const text =
    "🛍️ " + p.name +
    "\n💰 الثمن: " + p.price + " درهم" +
    "\n\n" + (p.desc || "") +
    "\n\n📦 للطلب والدخول للمتجر:" +
    "\n" + storeUrl;

  if (!p.image) {
    alert("هاد المنتج ما عندوش صورة.");
    return;
  }

  const imageUrl = p.image;

  window.open(imageUrl, "_blank");

  setTimeout(() => {

    if (navigator.share) {

      navigator.share({
        title: p.name,
        text: text,
        url: imageUrl
      });

    } else {

      alert(
        "الصورة تحلات. دابا تقدر تحفظها وتشاركها في Facebook أو Instagram أو WhatsApp."
      );

    }

  }, 500);
}
/* =========================
   تشغيل المتجر
========================= */

loadProducts();
async function importGitHubImages() {

  if (!auth.currentUser) {
    alert("خاصك تدخل لحساب الإدارة أولاً.");
    openLogin();
    return;
  }

  const apiUrl =
    "https://api.github.com/repos/awani-alakhawain/Awani-alakhawain-store/contents/";

  try {

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("GitHub API error");
    }

    const files = await response.json();

    const images = files.filter((file) => {

      return (
        file.type === "file" &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
      );

    });

    if (!images.length) {
      alert("ما لقيتش صور جديدة فـGitHub.");
      return;
    }

    let added = 0;

    for (const file of images) {

      const imageUrl =
        "https://raw.githubusercontent.com/awani-alakhawain/Awani-alakhawain-store/main/" +
        encodeURIComponent(file.name);

      const exists = products.some(
        (p) => p.image === imageUrl
      );

      if (exists) {
        continue;
      }

      await db
        .collection("products")
        .add({

          name: "منتج جديد",

          price: 0,

          cat: "أخرى",

          desc: "",

          image: imageUrl,

          emoji: "🛍️"

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

    console.error(error);

    alert(
      "وقع مشكل أثناء استيراد الصور ❌"
    );
  }
}
