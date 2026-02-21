const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Groq (OpenAI-compatible)
const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

app.post("/api/suggestions", async (req, res) => {
  try {
    if (!groq) {
      return res.status(503).json({
        error: "AI server not configured",
        message: "Set GROQ_API_KEY in server/.env to enable AI suggestions.",
      });
    }

    const { summary } = req.body;

    if (!summary || typeof summary !== "object") {
      return res.status(400).json({
        error: "Missing or invalid summary data",
      });
    }

    const income = Number(summary.income);
    const expenses = Number(summary.expenses);
    const savingsRate = Number(summary.savingsRate);
    const categories =
      summary.categories && typeof summary.categories === "object"
        ? summary.categories
        : {};
        const currencyMap = {
          INR: "₹",
          USD: "$",
          EUR: "€",
          GBP: "£",
        };
        
        const currency = currencyMap[summary.currency] || "₹";
        const categoryText = Object.entries(categories)
  .map(([cat, amount]) => `${cat}: ${currency}${amount}`)
  .join(", ");

        const prompt = `
        You are an expert personal finance advisor.
        
        Analyze the financial summary carefully and provide 3–5 highly personalized, data-driven suggestions.
        
        Financial Summary:
        - Income: ${currency}${isNaN(income) ? "unknown" : income}
        - Expenses: ${currency}${isNaN(expenses) ? "unknown" : expenses}
        - Savings Rate: ${isNaN(savingsRate) ? "unknown" : savingsRate}%
       - Spending by Category: ${categoryText || "No recorded expenses"}
        Instructions:
        - Use ${currency} for all monetary values.
        - Use the actual numbers provided.
        - If savings rate is high, suggest investment options.
        - If savings rate is low, suggest expense optimization.
        - If a category seems unusually high, suggest reducing it.
        - Suggest specific ${currency} amounts or percentages.
        - Avoid generic 50/30/20 rules unless clearly justified.
        - Output ONLY bullet points.
        - Each bullet must start with "- ".
        - No introduction.
        - No conclusion.
        `;

        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are a professional financial advisor that provides precise, data-backed, realistic budgeting and investment advice."
            },
            {
              role: "user",
              content: prompt,
            }
          ],
          temperature: 0.6,
          max_tokens: 250,
        });
    const text =
      completion.choices?.[0]?.message?.content?.trim() ||
      "No suggestions available.";

    return res.json({ suggestions: text });

  } catch (err) {
    console.error("[AI suggestions error]", err.message);
    return res.status(500).json({
      error: "AI request failed",
      message: err.message || "Could not get suggestions.",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiConfigured: !!process.env.GROQ_API_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`MoneyMind AI server running at http://localhost:${PORT}`);

  if (!process.env.GROQ_API_KEY) {
    console.warn(
      "⚠ GROQ_API_KEY not set. Create server/.env and add: GROQ_API_KEY=gsk_..."
    );
  }
});