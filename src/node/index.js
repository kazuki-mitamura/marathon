const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 5036;

const cors = require("cors");
app.use(cors());

const { Pool } = require("pg");
const pool = new Pool({
  user: "user_5036", // PostgreSQLのユーザー名に置き換えてください
  host: "postgres",
  database: "crm_5036", // PostgreSQLのデータベース名に置き換えてください
  password: "pass_5036", // PostgreSQLのパスワードに置き換えてください
  port: 5432,
});

app.listen(5036, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/customer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE customer_id = $1', [id]); // ← ✅ ここ重要！
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching customer:', err); // ← ここでエラー出てたはず
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// 全顧客の一覧を返すAPIを追加
app.get('/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY customer_id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

app.post("/customer/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

const path = require("path");
app.use(express.static("customer"));
app.use(express.json());

// HTMLページ（顧客一覧）を表示
app.get("/customer-list", (req, res) => {
  res.sendFile(path.join(__dirname, "customer", "list.html"));
});

// 顧客削除
app.delete('/customer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM customers WHERE customer_id = $1', [id]);
    if (result.rowCount > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: '顧客が見つかりません' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'サーバーエラー' });
  }
});

app.put("/customer/:id", async (req, res) => {
  const { company_name, industry, contact, location } = req.body;
  const customerId = req.params.id;  // ⭐ ここで定義する必要あり！

  try {
    await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4 WHERE customer_id = $5",
      [company_name, industry, contact, location, customerId]
    );

    res.send("Customer updated");
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).send("更新に失敗しました");
  }
});