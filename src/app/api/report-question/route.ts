import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REPORT_EMAIL = "amozeshgah.farda@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionText, options, correctAnswer, selectedAnswer, explanation, scenario, reportNote, wrongExplanations, userEmail } = body;

    const report = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      questionText,
      options,
      correctAnswer,
      selectedAnswer,
      explanation,
      wrongExplanations: wrongExplanations || {},
      scenario,
      reportNote: reportNote || "",
      userEmail: userEmail || "",
    };

    // 1. Save to local JSON file
    const reportsDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, "question-reports.json");
    let reports: any[] = [];
    if (fs.existsSync(reportPath)) {
      reports = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    }
    reports.push(report);
    fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));

    // 2. Send email
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass && gmailPass !== "your-app-password-here") {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        });

        // Find correct answer label
        const correctOption = (options || []).find((o: any) => o.value === correctAnswer);
        const correctLabel = correctOption ? correctOption.label : correctAnswer;

        // Build options list with correct/wrong indicators
        const optionsHtml = (options || [])
          .map((o: any, i: number) => {
            const isCorrect = o.value === correctAnswer;
            const isSelected = o.value === selectedAnswer;
            const bgColor = isCorrect ? "#d9f0e4" : isSelected ? "#fee2e2" : "#fff";
            const borderColor = isCorrect ? "#16a34a" : isSelected ? "#dc2626" : "#ddd";
            const marker = isCorrect ? " ✓ پاسخ صحیح" : isSelected ? " ← انتخاب کاربر" : "";
            const wrongReason = !isCorrect && wrongExplanations && wrongExplanations[o.value]
              ? `<div style="font-size:11px;color:#991b1b;margin-top:4px;">علت نادرستی: ${wrongExplanations[o.value]}</div>`
              : "";
            return `<div style="background:${bgColor};border:1px solid ${borderColor};padding:8px 12px;border-radius:8px;margin:4px 0;">
              <b>${i + 1}.</b> ${o.label} <span style="font-size:11px;font-weight:bold;">${marker}</span>
              ${wrongReason}
            </div>`;
          })
          .join("");

        // Build wrong explanations section
        const wrongExplanationsHtml = wrongExplanations && Object.keys(wrongExplanations).length > 0
          ? `<div style="background:#fff3cd;padding:15px;border-radius:10px;margin:10px 0;">
              <strong style="color:#856404;">بررسی علت نادرستی سایر گزینه‌ها:</strong>
              ${Object.entries(wrongExplanations).map(([val, reason]: [string, any]) => {
                const opt = (options || []).find((o: any) => o.value === val);
                return `<div style="margin:6px 0;padding:6px;background:#fff;border-radius:6px;">
                  <b>«${opt ? opt.label : val}»:</b> ${reason}
                </div>`;
              }).join("")}
            </div>`
          : "";

        const emailHtml = `
          <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1d6fd6;">📋 گزارش سؤال نادرست — شبیه‌ساز الکتروسکوپ</h2>
            <p style="color: #666; font-size: 12px;">زمان: ${report.timestamp}</p>

            <div style="background: #f0f6fc; padding: 15px; border-radius: 10px; margin: 10px 0;">
              <strong style="color: #1d6fd6;">متن سؤال:</strong>
              <p style="margin: 5px 0;">${questionText}</p>
            </div>

            <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 10px; margin: 10px 0;">
              <strong style="color: #1d6fd6;">گزینه‌ها و پاسخ صحیح:</strong>
              <div style="margin: 5px 0;">${optionsHtml}</div>
            </div>

            <div style="background: #d9f0e4; padding: 12px 15px; border: 2px solid #16a34a; border-radius: 10px; margin: 10px 0;">
              <strong style="color: #065f46;">✓ پاسخ صحیح:</strong>
              <span style="font-weight: bold; color: #065f46;"> ${correctLabel}</span>
            </div>

            <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 10px; margin: 10px 0;">
              <strong style="color: #1d6fd6;">توضیح علمی:</strong>
              <p style="margin: 5px 0;">${explanation}</p>
            </div>

            ${wrongExplanationsHtml}

            <div style="background: #fef9e7; padding: 15px; border-radius: 10px; margin: 10px 0;">
              <strong style="color: #854d0e;">سناریوی آزمایش:</strong>
              <ul style="margin: 5px 0; padding-right: 20px;">
                <li>بار الکتروسکوپ: ${scenario?.electroscopeCharge || "?"}</li>
                <li>بار میله: ${scenario?.rodCharge || "?"}</li>
                <li>نوع آزمایش: ${scenario?.experimentType === "contact" ? "تماس" : "نزدیک کردن"}</li>
                <li>مقدار بار: ${scenario?.rodMagnitude || "?"}</li>
              </ul>
            </div>

            <div style="background: #fee2e2; padding: 15px; border-radius: 10px; margin: 10px 0;">
              <strong style="color: #991b1b;">یادداشت کاربر:</strong>
              <p style="margin: 5px 0;">${reportNote || "(بدون توضیح)"}</p>
            </div>

            ${userEmail ? `
            <div style="background: #e0f2fe; padding: 15px; border: 2px solid #0ea5e9; border-radius: 10px; margin: 10px 0;">
              <strong style="color: #075985;">📧 ایمیل کاربر (برای پاسخ):</strong>
              <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${userEmail}</p>
            </div>
            ` : ''}
          </div>
        `;

        await transporter.sendMail({
          from: `"شبیه‌ساز الکتروسکوپ" <${gmailUser}>`,
          to: REPORT_EMAIL,
          subject: "📋 گزارش سؤال نادرست — شبیه‌ساز الکتروسکوپ",
          html: emailHtml,
          ...(userEmail ? { replyTo: userEmail } : {}),
        });

        console.log("Report email sent successfully");
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true, message: "گزارش شما ثبت شد. متشکریم!" });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت گزارش" },
      { status: 500 }
    );
  }
}
