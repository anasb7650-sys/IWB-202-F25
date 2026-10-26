$(document).ready(function () {

    // 1. إظهار وإخفاء تفاصيل السيارة مع صورتها الكبيرة عبر jQuery
    $(".toggle-details").on("change", function () {
        var targetId = "#" + $(this).val();
        if ($(this).is(":checked")) {
            $(targetId).fadeIn(300);
        } else {
            $(targetId).fadeOut(200);
        }
    });

    // 2. زر متابعة لإظهار الفورم
    $("#continueBtn").on("click", function () {
        var selectedCount = $(".select-car:checked").length;
        if (selectedCount === 0) {
            $("#carSelectError").text("يرجى اختيار سيارة واحدة على الأقل من الجدول للمتابعة.");
            $("#bookingFormContainer").slideUp(200);
        } else {
            $("#carSelectError").text("");
            $("#bookingFormContainer").slideDown(400);
        }
    });

    // إزالة رسالة خطأ اختيار السيارة عند تحديد أي سيارة
    $(".select-car").on("change", function () {
        if ($(".select-car:checked").length > 0) {
            $("#carSelectError").text("");
        }
    });

    // 3. التحقق الفوري من الاسم الكامل أثناء الكتابة (الاسم والكنية وبالعربي حصراً)
    $("#fullName").on("input", function () {
        var val = $(this).val();
        var trimmedVal = val.trim();
        if (trimmedVal === "") {
            $("#nameError").text("");
            return;
        }
        var arabicOnlyRegex = /^[\u0621-\u064A\s]+$/;
        var fullNameTwoWordsRegex = /^[\u0621-\u064A]+\s+[\u0621-\u064A\s]+$/;

        if (!arabicOnlyRegex.test(val)) {
            $("#nameError").text("يرجى كتابة الاسم والكنية باللغة العربية حصراً بدون أحرف أجنبية أو أرقام.");
        } else if (!fullNameTwoWordsRegex.test(trimmedVal)) {
            $("#nameError").text("يرجى إدخال الاسم والكنية معاً باللغة العربية (مثال: محمد العلي).");
        } else {
            $("#nameError").text("");
        }
    });

    // 4. منع كتابة المحارف في خانة الرقم الوطني (أرقام فقط) والتحقق الفوري
    $("#nationalId").on("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        var val = $(this).val();
        var nationalIdRegex = /^(0[1-9]|1[0-4])\d{9}$/;

        if (val === "") {
            $("#nidError").text("الرقم الوطني إلزامي الإدخال.");
        } else if (!/^(0[1-9]|1[0-4])/.test(val)) {
            $("#nidError").text("أول خانتين يجب أن ترمزا إلى المحافظة (من 01 إلى 14).");
        } else if (val.length < 11 || !nationalIdRegex.test(val)) {
            $("#nidError").text("يجب أن يتكون الرقم الوطني من 11 خانة رقمية تماماً.");
        } else {
            $("#nidError").text("");
        }
    });

    // 5. التحقق الفوري من تاريخ البداية وتاريخ النهاية
    $("#startDate, #endDate").on("change input", function () {
        var startVal = $("#startDate").val();
        var endVal = $("#endDate").val();

        if (startVal !== "") {
            $("#startDateError").text("");
        }

        if (startVal !== "" && endVal !== "") {
            var startDate = new Date(startVal);
            var endDate = new Date(endVal);
            if (endDate <= startDate) {
                $("#endDateError").text("(يجب أن يكون بعد تاريخ البداية)");
            } else {
                $("#endDateError").text("");
            }
        } else if (endVal !== "") {
            $("#endDateError").text("");
        }
    });

    // 6. منع كتابة المحارف في خانة الموبايل (أرقام فقط) والتحقق الفوري لـ Syriatel و MTN
    $("#mobile").on("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        var val = $(this).val();
        if (val === "") {
            $("#mobileError").text("");
            return;
        }
        var syrianMobileRegex = /^09[345689]\d{7}$/;
        if (!syrianMobileRegex.test(val)) {
            $("#mobileError").text("الرقم غير مطابق! يجب أن يتكون من 10 أرقام ويبدأ بمقاسم Syriatel (093, 098, 099) أو MTN (094, 095, 096).");
        } else {
            $("#mobileError").text("");
        }
    });

    // 7. التحقق الفوري من البريد الإلكتروني مع إظهار مثال عن الصيغة الصحيحة
    $("#email").on("input", function () {
        var val = $(this).val().trim();
        if (val === "") {
            $("#emailError").text("");
            return;
        }
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
            $("#emailError").text("صيغة البريد الإلكتروني غير صحيحة! مثال عن الصيغة الصحيحة: example@domain.com");
        } else {
            $("#emailError").text("");
        }
    });

    // إغلاق نافذة النتيجة المنبثقة
    $("#closeModalBtn").on("click", function () {
        $("#resultModalOverlay").fadeOut(250);
    });

});

// الدالة الرئيسية عند الضغط على زر "إرسال"
function validateAndCalculate() {
    var fullName = document.getElementById("fullName").value.trim();
    var nationalId = document.getElementById("nationalId").value.trim();
    var startDateStr = document.getElementById("startDate").value;
    var endDateStr = document.getElementById("endDate").value;
    var mobile = document.getElementById("mobile").value.trim();
    var email = document.getElementById("email").value.trim();

    var isValid = true;

    // التحقق من اختيار سيارة واحدة على الأقل
    var selectedCheckboxes = document.querySelectorAll(".select-car:checked");
    if (selectedCheckboxes.length === 0) {
        $("#carSelectError").text("يرجى اختيار سيارة واحدة على الأقل من الجدول.");
        return false;
    }

    // 1. فحص الاسم الكامل (اختياري، ولكن إن وُجد يجب أن يكون اسم وكنية بالعربي)
    if (fullName !== "") {
        var fullNameRegex = /^[\u0621-\u064A]+\s+[\u0621-\u064A\s]+$/;
        if (!fullNameRegex.test(fullName)) {
            $("#nameError").text("يرجى إدخال الاسم والكنية معاً باللغة العربية حصراً (مثال: محمد العلي).");
            isValid = false;
        } else {
            $("#nameError").text("");
        }
    }

    // 2. فحص الرقم الوطني (إلزامي)
    var nationalIdRegex = /^(0[1-9]|1[0-4])\d{9}$/;
    if (nationalId === "") {
        $("#nidError").text("حقل الرقم الوطني إلزامي الإدخال.");
        isValid = false;
    } else if (!nationalIdRegex.test(nationalId)) {
        $("#nidError").text("يجب أن يتكون من 11 رقماً وتبدأ أول خانتين برمز المحافظة (01-14).");
        isValid = false;
    } else {
        $("#nidError").text("");
    }

    // 3. فحص تاريخي البداية والنهاية (إلزاميان)
    if (startDateStr === "") {
        $("#startDateError").text("تاريخ بداية التأجير إلزامي الإدخال.");
        isValid = false;
    } else {
        $("#startDateError").text("");
    }

    if (endDateStr === "") {
        $("#endDateError").text("تاريخ نهاية التأجير إلزامي الإدخال.");
        isValid = false;
    } else if (startDateStr !== "") {
        var startDate = new Date(startDateStr);
        var endDate = new Date(endDateStr);
        if (endDate <= startDate) {
            $("#endDateError").text("(يجب أن يكون بعد تاريخ البداية)");
            isValid = false;
        } else {
            $("#endDateError").text("");
        }
    }

    // 4. فحص رقم الموبايل (اختياري، وإن وُجد يطابق Syriatel أو MTN)
    if (mobile !== "") {
        var syrianMobileRegex = /^09[345689]\d{7}$/;
        if (!syrianMobileRegex.test(mobile)) {
            $("#mobileError").text("الرقم غير مطابق! يجب أن يتكون من 10 أرقام ويبدأ بمقاسم Syriatel (093, 098, 099) أو MTN (094, 095, 096).");
            isValid = false;
        } else {
            $("#mobileError").text("");
        }
    }

    // 5. فحص البريد الإلكتروني (اختياري، وإن وُجد يطابق الصيغة)
    if (email !== "") {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            $("#emailError").text("صيغة البريد الإلكتروني غير صحيحة! مثال عن الصيغة الصحيحة: example@domain.com");
            isValid = false;
        } else {
            $("#emailError").text("");
        }
    }

    if (!isValid) {
        return false;
    }

    // 6. الحسابات وعرض النتيجة في النافذة بمنتصف الصفحة
    var startObj = new Date(startDateStr);
    var endObj = new Date(endDateStr);
    var diffTime = endObj.getTime() - startObj.getTime();
    var rentalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    var totalBeforeDiscount = 0;
    var carsHtmlList = "<ul>";

    for (var i = 0; i < selectedCheckboxes.length; i++) {
        var carCode = selectedCheckboxes[i].value;
        var carModel = selectedCheckboxes[i].getAttribute("data-model");
        var dailyPrice = parseFloat(selectedCheckboxes[i].getAttribute("data-price"));
        var carTotal = dailyPrice * rentalDays;

        totalBeforeDiscount += carTotal;

        carsHtmlList += "<li><strong>" + carModel + " (" + carCode + ")</strong>: " +
            rentalDays + " يوم × " + dailyPrice + " ل.س = <strong>" + carTotal + " ل.س</strong></li>";
    }
    carsHtmlList += "</ul>";

    // تطبيق خصم 10% في حال تجاوزت المدة 7 أيام
    var discountAmount = 0;
    if (rentalDays > 7) {
        discountAmount = totalBeforeDiscount * 0.10;
    }
    var finalAmount = totalBeforeDiscount - discountAmount;

    // بناء تفاصيل الحجز شاملة معلومات مقدم الطلب والسيارات والحساب النهائي
    var customerInfoHtml = "<p>" +
        "<strong>الاسم الكامل:</strong> " + (fullName !== "" ? fullName : "غير مدخل") + "<br />" +
        "<strong>الرقم الوطني:</strong> " + nationalId + "<br />" +
        "<strong>فترة التأجير:</strong> من " + startDateStr + " إلى " + endDateStr + " (" + rentalDays + " يوم)<br />" +
        "<strong>رقم الموبايل:</strong> " + (mobile !== "" ? mobile : "غير مدخل") + "<br />" +
        "<strong>البريد الإلكتروني:</strong> " + (email !== "" ? email : "غير مدخل") +
        "</p><hr />";

    var resultHtml = customerInfoHtml +
        "<p><strong>السيارات المختارة وعدد أيام التأجير لكل سيارة:</strong></p>" +
        carsHtmlList +
        "<div class='summary-highlight'>" +
        "<p><strong>المجموع قبل الخصم:</strong> " + totalBeforeDiscount + " ل.س</p>" +
        "<p><strong>قيمة الخصم (10% لتجاوز 7 أيام):</strong> " + discountAmount + " ل.س</p>" +
        "<p><strong>المبلغ الإجمالي النهائي:</strong> " + finalAmount + " ل.س</p>" +
        "</div>";

    // عرض النافذة المنبثقة في منتصف الصفحة
    $("#resultContent").html(resultHtml);
    $("#resultModalOverlay").fadeIn(300);

    // تفريغ جميع خانات الفورم والرسائل بعد الإرسال وإبقاء المعلومات داخل نافذة تفاصيل الحجز فقط
    document.getElementById("rentalForm").reset();
    $(".error-msg").text("");

    return false;
}