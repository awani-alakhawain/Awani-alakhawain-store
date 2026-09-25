
/* =========================================================
   🔐 AUTH STATE
   ========================================================= */

if (typeof auth !== "undefined") {

  auth.onAuthStateChanged(user => {

    if (user) {

      console.log(
        "👤 تم تسجيل الدخول للإدارة."
      );

      if (
        document.getElementById("admin")
      ) {

        renderAdmin();
        loadCategories();

      }

    } else {

      console.log(
        "👤 لا يوجد حساب إدارة مسجل."
      );

    }

  });

}
