# Adam's House

E-commerce website for a furniture showroom, built for a real client. I designed and developed the full project on my own.

**Live site:** https://adams-orpin.vercel.app/

## Features

- Nine categories, from living rooms and master bedrooms to children's rooms, salons, and restaurants and cafes
- A product page for each item, with images and colors
- Shopping cart, customer registration and login, and account page
- Manager login and dashboard for managing the showroom
- Arabic and English interface (`js/translate.js`)
- SQL Server schema for products, categories, orders, customers and sessions (`database/schema_sqlserver.sql`)

## Tech

HTML5, CSS3, JavaScript, SQL Server (T-SQL), deployed on Vercel

## Project structure

```
categories/   category pages
products/     product pages
js/           shared scripts (data, auth, dashboard, translation)
css/          styles
database/     SQL Server schema
photos/       images
```

## Setup note

Before using this code for a real deployment, change the default manager credentials in `js/data.js` and in the database seed, and do not rely on client-side checks alone for access control.

## Author

Mahmoud Badea Elzaman, Faculty of Computers and Information, Kafrelsheikh University.
