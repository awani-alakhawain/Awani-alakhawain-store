const starter = [
  {
    id: "1",
    name: "إبريق أنوكس",
    price: 100,
    cat: "أباريق",
    emoji: "🫖",
    desc: "إبريق أنوكس بجودة جيدة."
  },
  {
    id: "2",
    name: "طقم أواني الطبخ",
    price: 249,
    cat: "أواني الطبخ",
    emoji: "🍳",
    desc: "طقم عملي للمطبخ."
  },
  {
    id: "3",
    name: "كاسرولة أنوكس",
    price: 120,
    cat: "أواني الطبخ",
    emoji: "🥘",
    desc: "كاسرولة أنوكس للاستعمال اليومي."
  },
  {
    id: "4",
    name: "صينية تقديم",
    price: 80,
    cat: "أواني منزلية",
    emoji: "🍽️",
    desc: "صينية أنيقة للتقديم."
  }
];

let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "{}");

const $ = s => document.querySelector(s);

/* جلب المنتجات من Firebase */
async function loadProducts() {
  try {
    const snapshot = await db.collection("products").get();

    products = [];

    snapshot.forEach(doc => {
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

/* عرض المنتجات */
function render() {

  let q = ($("#search").value || "").toLowerCase();
  let c = $("#cat").value;

  let cats = [...new Set(products.map(p => p.cat))];

  $("#cat").innerHTML =
    '<option value="">كل الفئات</option>' +
    cats.map(x =>
      `<option ${x === c ? "selected" : ""}>${x}</option>`
    ).join("");

  $("#products").innerHTML =
    products
      .filter(p =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!c || p.cat === c)
      )
      .map(p => {

        let picture = p.image
          ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:220px;object-fit:cover;border-radius:12px;">`
          : `<div class="pic">${p.emoji || "🛍️"}</div>`;

        return `
          <article class="card">

            ${picture}

            <div class="body">

              <h3>${p.name}</h3>

              <small>${p.cat}</small>

              <p>${p.desc || ""}</p>

              <div class="price">
                ${p.price} درهم
              </div>

              <button
                class="add"
                onclick="add('${p.id}')">
                أضف للسلة
              </button>

              <button
                onclick="orderNow('${p.id}')"
                style="margin-top:8px;width:100%;">
                🟢 أطلب الآن عبر واتساب
              </button>

            </div>

          </article>
        `;

      }).join("") || "<p>لا توجد منتجات.</p>";

  renderCart();
}

/* السلة */
function renderCart() {

  let n = 0;
  let sum = 0;

  $("#items").innerHTML =
    Object.keys(cart).map(id => {

      let p = products.find(x => x.id === id);

      if (!p) return "";

      let q = cart[id];

      n += q;
      sum += p.price * q;

      return `
        <div class="row">

          <span>
            ${p.name}<br>
            ${p.price} × ${q}
          </span>

          <span>
            <button onclick="chg('${id}',-1)">−</button>
            ${q}
            <button onclick="chg('${id}',1)">+</button>
          </span>

        </div>
      `;

    }).join("") || "<p>السلة فارغة.</p>";

  $("#count").textContent = n;
  $("#total").textContent = sum;
}

/* إضافة للسلة */
function add(id) {

  cart[id] = (cart[id] || 0) + 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();

  openCart();
}

/* تغيير الكمية */
function chg(id, d) {

  cart[id] = (cart[id] || 0) + d;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}

/* طلب مباشر عبر واتساب */
function orderNow(id) {

  const p = products.find(x => x.id === id);

  if (!p) return;

  const msg =
    `السلام عليكم، أريد طلب:%0A%0A` +
    `المنتج: ${p.name}%0A` +
    `الثمن: ${p.price} درهم`;

  location.href =
    "https://wa.me/212718000706?text=" + msg;
}

/* فتح وإغلاق السلة */
function openCart() {
  $("#cart").classList.add("open");
}

function closeCart() {
  $("#cart").classList.remove("open");
}

/* الإدارة */
function openAdmin() {
  $("#admin").classList.add("open");
  renderAdmin();
}

function closeAdmin() {
  $("#admin").classList.remove("open");
}

function renderAdmin() {

  $("#adminList").innerHTML =
    products.map(p => `
      <div class="adminrow">

        <b>${p.name}</b>
        — ${p.price}dh

        <br>

        <small>${p.cat}</small>

        <br>

        <button onclick="edit('${p.id}')">
          ✏️ تعديل
        </button>

      </div>
    `).join("");

}

/* تعديل */
function edit(id) {

  let p = products.find(x => x.id === id);

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

/* حفظ المنتج */
$("#productForm").onsubmit = async e => {

  e.preventDefault();

  let id = $("#editId").value;

  let data = {

    name: $("#pname").value.trim(),

    price: Number($("#pprice").value),

    cat: $("#pcat").value.trim(),

    desc: $("#pdesc").value.trim(),

    image: $("#pimage").value.trim(),

    emoji: $("#pemoji").value.trim() || "🛍️"

  };

  try {

    if (id) {

      await db.collection("products")
        .doc(id)
        .set(data);

    } else {

      await db.collection("products")
        .add(data);

    }

    e.target.reset();

    $("#editId").value = "";

    alert("تم حفظ المنتج في المتجر Online ✅");

    await loadProducts();

  } catch (error) {

    console.error(error);

    alert("ما قدرناش نحفظو المنتج في Firebase.");

  }

};

/* إرسال السلة عبر واتساب */
$("#order").onsubmit = e => {

  e.preventDefault();

  if (!Object.keys(cart).length) {
    return alert("السلة فارغة");
  }

  let f = new FormData(e.target);

  let items = Object.keys(cart)
    .map(id => {

      let p = products.find(x => x.id === id);

      return `${p.name} x${cart[id]}`;

    })
    .join("، ");

  let msg =
    `السلام عليكم، أريد الطلب:%0A` +
    `${items}%0A` +
    `الاسم: ${f.get("name")}%0A` +
    `الهاتف: ${f.get("phone")}%0A` +
    `العنوان: ${f.get("address")}`;

  location.href =
    "https://wa.me/212718000706?text=" + msg;
};

/* البحث */
$("#search").oninput = render;

$("#cat").onchange = render;

/* تشغيل المتجر */
loadProducts();
