from flask import Flask, jsonify, request
from collections import defaultdict
from datetime import datetime  # Add this import

app = Flask(__name__)

def format_currency(value):
    return f"${value:,.2f}"

@app.route("/monthly-summary", methods=["POST"])
def monthly_summary():
    data = request.json
    transactions = data.get("transactions", [])
    
    if not transactions:
        return jsonify({"summary": "No transactions found."})

    # Get the current month and year to filter data
    now = datetime.now()
    curr_month = now.month
    curr_year = now.year

    exp_totals = defaultdict(float)
    total_income = 0
    total_expense = 0
    
    for t in transactions:
        # Parse the date from the transaction
        # Handles ISO format like '2025-12-25T...'
        t_date = datetime.fromisoformat(t.get("date").replace("Z", "+00:00"))
        
        # ONLY process transactions for the current month and year
        if t_date.month == curr_month and t_date.year == curr_year:
            amt = float(t.get("amount", 0))
            if t.get("type") == "expense":
                cat = t.get("category", "Miscellaneous")
                exp_totals[cat] += amt
                total_expense += amt
            elif t.get("type") == "income":
                total_income += amt

    if total_expense == 0:
        return jsonify({"summary": "No expenses recorded for this month yet."})

    top_cat = max(exp_totals, key=exp_totals.get)
    top_percent = (exp_totals[top_cat] / total_expense) * 100

    # Financial Judgment Logic
    status_message = ""
    if total_income > 0:
        expense_ratio = (total_expense / total_income) * 100
        if expense_ratio > 90:
            status_message = "\n\n🔴 Warning: Your expenses are critically high compared to your income!"
        elif expense_ratio > 70:
            status_message = "\n\n🟡 Caution: Your expenses are quite high this month."
        else:
            status_message = "\n\n🟢 Everything looks fine! Your spending is well-balanced within your income."
    else:
        status_message = "\n\n⚠️ Note: No income recorded this month to compare against."

    summary_text = (
        f"This month, you spent a total of {format_currency(total_expense)}. "
        f"Your highest spending was in {top_cat}, which accounts for {top_percent:.1f}% of total expenses. "
        f"{status_message}"
    )

    return jsonify({
        "summary": summary_text,
        "total": total_expense,
        "topCategory": top_cat
    })

if __name__ == "__main__":
    print("🚀 AI Insights Service is running on http://127.0.0.1:8001")
    # debug=True allows the server to reload automatically when you save
    app.run(port=8001, debug=True)