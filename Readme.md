### ✅ Updated `Readme.md` (with token system)

```md
# Loop Modifier – Token-Based G-code Looping Tool

## 🔍 Overview

Loop Modifier is a web-based tool that lets users upload `.3mf` files and repeat their G-code instructions. It supports a **token-based access system**:

- 🔓 Full Version: Unlimited loops via `?token=VALID_TOKEN`
- 🔒 Lite Version: Max 3 loops with upgrade link

---

## 🚀 Deployment Instructions

### 1. File Structure
```

/home/YOUR_USERNAME/
├── token.txt # Contains the current valid token
├── public_html/
│ ├── index.php # Entry point – checks token
│ ├── full.html # Full version of the tool
│ ├── lite.html # Lite version of the tool
│ ├── gen_token.php # Script to regenerate token monthly
│ ├── lib/
│ │ ├── js/process.js
│ │ └── css/style.css
│ └── assets/

```

---

### 2. Setting Up Token Authentication

- `index.php` will read the token from `../token.txt`.
- If the URL contains `?token=VALID_TOKEN`, it loads `full.html`.
- Otherwise, it loads `lite.html`.

Example:
```

https://yourdomain.com?token=abc123 → Full version
https://yourdomain.com → Lite version

```

---

## 🔁 Monthly Token Auto-Rotation (Cron)

Use the included `gen_token.php` to:

- Generate a new token
- Save it in `../token.txt`

Example cron job (run on the 1st of each month at midnight):

```

0 0 1 \* \* php /home/YOUR_USERNAME/public_html/gen_token.php

```

---

## 🧪 Testing

### Full Version:
- Visit with correct token in URL
- Upload a valid `.3mf` file
- Set any loop count (e.g. 20)
- Click “Process & Download”

### Lite Version:
- Visit without token
- Max loop allowed = 3
- Extra text and "Get Full Version" button will appear
- UI restricts loop > 3 and glows upgrade button

---

## 🛠 Dependencies

- [JSZip](https://stuk.github.io/jszip/) – used for `.3mf` archive manipulation

---

## ✅ Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
```
