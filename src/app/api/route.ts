import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const REPORT_EMAIL =
  process.env.REPORT_EMAIL_TO || "amozeshgah.farda@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionText,
      options,
      correctAnswer,
      selectedAnswer,
      explanation,
      scenario,
      reportNote,
      wrongExplanations,
      userEmail,
    } = body;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    let emailSent = false;

    if (gmailUser && gmailPass && gmailPass !== "your-app-password-here") {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user: gmailUser, pass: gmailPass },
        });

        const correctOption = (options || []).find(
          (o: any) => o.value === correctAnswer,
        );
        const correctLabel = correctOption
          ? correctOption.label
          : correctAnswer;

        const optionsText = (options || [])
          .map((o: any, i: number) => {
            const isCorrect = o.value === correctAnswer;
            const isSelected = o.value === selectedAnswer;
            let line = `${i + 1}. ${o.label}`;
            if (isCorrect) line += " ✓ (پاسخ صحیح)";
            if (isSelected) line += " ← (انتخاب کاربر)";
            if (!isCorrect && wrongExplanations && wrongExplanations[o.value]) {
              line += `\n   علت نادرستی: ${wrongExplanations[o.value]}`;
            }
            return line;
          })
          .join("\n");

        const wrongText =
          wrongExplanations && Object.keys(wrongExplanations).length > 0
            ? "\n\nبررسی علت نادرستی سایر گزینه‌ها:\n" +
              Object.entries(wrongExplanations)
                .map(([val, reason]: [string, any]) => {
                  const opt = (options || []).find((o: any) => o.value === val);
                  return `- «${opt ? opt.label : val}»: ${reason}`;
                })
                .join("\n")
            : "";

        const emailText = `گزارش سؤال نادرست — شبیه‌ساز الکتروسکوپ

زمان: ${new Date().toISOString()}

متن سؤال:
 ${questionText}

گزینه‌ها:
 ${optionsText}

پاسخ صحیح: ${correctLabel}

توضیح علمی:
 ${explanation}
 ${wrongText}

سناریو:
- بار الکتروسکوپ: ${scenario?.electroscopeCharge || "?"}
- بار میله: ${scenario?.rodCharge || "?"}
- نوع آزمایش: ${scenario?.experimentType === "contact" ? "تماس" : "نزدیک کردن"}
- مقدار بار: ${scenario?.rodMagnitude || "?"}

یادداشت کاربر: ${reportNote || "(بدون توضیح)"}

ایمیل کاربر: ${userEmail || "(بدون ایمیل)"}
`;

        await transporter.sendMail({
          from: gmailUser,
          to: REPORT_EMAIL,
          subject: "📋 گزارش سؤال نادرست — شبیه‌ساز الکتروسکوپ",
          text: emailText,
          ...(userEmail ? { replyTo: userEmail } : {}),
        });

        emailSent = true;
      } catch (err) {
        // Email failed but don't crash the API
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "گزارش شما ثبت و ارسال شد. متشکریم!"
        : "گزارش شما ثبت شد. متشکریم!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطا در ثبت گزارش" },
      { status: 500 },
    );
  }
}
