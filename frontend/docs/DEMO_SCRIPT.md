# CRMB Kiosk — Demo Script
### Basic feature run-through, divided into 3 members

---

## 👤 Member 1 — Splash & Menu

**Start at:** `https://crmbmern.vercel.app`

---

"This is CRMB Kiosk — a self-service ordering system for an artisan bakery and café."

*Show the splash screen*

"When a customer approaches the kiosk, they see this welcome screen. There's a jazz radio player up top — they can tap it to play music while they browse."

*Tap the screen to go to the menu*

"Tapping anywhere brings them to the menu. You can see all the products loaded here — these are coming live from our MongoDB database through the backend API."

*Tap a category filter*

"They can filter by category — Bread, Pastries, or Drinks. The menu updates instantly."

*Type in the search bar*

"They can also search by name. Results filter in real time as they type."

*Tap a product card*

"Tapping a product opens the details page — full description, price, and a quantity selector. They can adjust how many they want before adding."

*Tap the + button a couple times, then tap Add to Order*

"Tapping Add to Order adds it to their cart. You can see the thumbnail fly toward the cart button, the button bumps, and a notification appears confirming the item was added."

*Go back to menu, add one more item*

"They can keep browsing and adding more items."

---

**Hand off to Member 2**

---

## 👤 Member 2 — Cart & Checkout

**Start at:** the menu with at least 2 items in the cart

---

*Tap the cart button*

"When they're ready, they tap the Order button to review their cart."

"They can see all their items here with the quantities and prices. They can tap + or − to adjust quantities, or the trash icon to remove an item entirely."

*Adjust a quantity, then remove an item, then add it back*

"The cart updates in real time. The total at the bottom recalculates automatically."

*Tap Proceed to Checkout*

"When they're happy with their order, they proceed to checkout. This shows a full order summary with the total."

*Tap Confirm Order*

"Tapping Confirm Order starts the process. The button morphs into a spinner, and a queue tracker appears showing the order moving through the kitchen — Received, Preparing, Baking, Ready."

*Wait for the animation to complete*

"Once it's done, the receipt appears. It shows the order ID, every item they ordered, the total, and the status. They can print this or just note the order ID."

*Tap New Order*

"Tapping New Order resets the kiosk back to the splash screen for the next customer. The order they just placed is now saved permanently in the database."

---

**Hand off to Member 3**

---

## 👤 Member 3 — Admin Panel

**Start at:** `https://crmbmern.vercel.app/admin-login`

---

"The admin panel is for staff. It's accessed through a separate login page."

*Type in credentials: crmb / admin123, tap Sign In*

"Staff log in with their credentials. These are verified against the database — the password is stored as a bcrypt hash, never plain text."

*Show the dashboard*

"This is the admin dashboard. At the top you can see the stats — total orders placed, total revenue, and how many items are on the menu. All of this is pulled live from the database."

*Scroll down to Recent Orders*

"Below that is the order history. Every order the customer just placed shows up here with the order ID, date, item count, and total."

*Scroll down to Menu Items*

"And here's the full menu management section. Staff can see every product with its status — Active means it's visible on the customer menu, Hidden means it's not."

*Tap Add Item*

"Tapping Add Item opens a form. Staff can fill in the product name, description, price, category, image URL, and tags."

*Fill in a quick product and save it*

"Once saved, the product is added to MongoDB and appears on the customer menu immediately."

*Tap the edit button on any product*

"They can also edit existing products — change the price, toggle availability, update the description."

*Toggle a product to Hidden*

"Setting a product to Hidden removes it from the customer menu without deleting it. Useful for seasonal items or when something runs out."

*Tap the delete button on the product just added, confirm*

"And they can delete products permanently."

*Tap Logout*

"Logging out ends the session and returns to the splash screen."

---

"That's the full feature set — customer ordering flow and staff management, all connected to a live database."

*Show `https://crmb-backend.onrender.com/api/products` in the browser*

"And here's proof the API is live — this is the raw data our frontend is reading from."
