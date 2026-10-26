# Victim Advocacy Associates website

The complete VAA website as plain HTML, CSS and JavaScript. There is no build step and no framework. Upload the files as they are to any web host or to GitHub Pages.

## What's in this folder

| File | What it is |
|------|-----------|
| `index.html` | Home page |
| `attorneys.html`, `individuals.html`, `how-it-works.html`, `our-work.html`, `sample-work.html`, `about.html`, `advocates.html`, `resources.html`, `contact.html` | Main pages |
| `privacy.html`, `terms.html`, `accessibility.html` | Legal pages |
| `404.html` | Shown when someone visits a page that doesn't exist |
| `theme.css` | All colors, fonts and layout |
| `site.js` | Mobile menu, contact form and the state finder |
| `states.js` | Each state's victim compensation program and attorney general links, used by the state finder on `resources.html` |
| `*.png`, `*.jpg` | Logo crest, photo, icons and the social-sharing image |
| `sitemap.xml`, `robots.txt` | Help search engines find every page |
| `CNAME` | Tells GitHub Pages to use victimadvocacy.com |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Option A: GitHub Pages (free)

1. **Create the repository.** Sign in at github.com and create a new **public** repository, for example `vaa-website`.
2. **Upload the files.** Click **Add file > Upload files** and drag in everything in this folder, including `CNAME` and `.nojekyll`. Your Mac hides files that start with a dot; press **Cmd + Shift + .** in Finder to show them. Then commit.
3. **Turn on Pages.** Go to **Settings > Pages**. Under **Source**, choose **Deploy from a branch**, then branch **main** and folder **/ (root)**. Save.
4. **Set the custom domain.** On the same page, **Custom domain** should show `victimadvocacy.com` from the CNAME file. If it doesn't, type it in and save.
5. **Point the domain at GitHub.** In GoDaddy, open **DNS** for victimadvocacy.com:
   - Add four **A** records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Add a **CNAME** record for `www` pointing to `YOUR-GITHUB-USERNAME.github.io`
   - Remove any other A records for `@`, such as GoDaddy parking.
6. **Turn on HTTPS.** Once GitHub shows the domain as verified, check **Enforce HTTPS**. DNS changes can take a few hours.

To update the site later, upload the changed files to the same repository. GitHub republishes automatically within a minute or two.

## Option B: Netlify (drag and drop)

1. Sign up at netlify.com and choose **Add new site > Deploy manually**.
2. Drag this whole folder onto the page.
3. Under **Domain management**, add `victimadvocacy.com` and follow Netlify's DNS steps for GoDaddy. Netlify ignores the `CNAME` file; that's fine.

## Contact form

The form sends inquiries through **Web3Forms**, using the access key already in `contact.html`. Messages go to the email address registered with that Web3Forms key.

- **After launch, send yourself one test inquiry** to confirm it arrives.
- If it doesn't arrive, sign in at web3forms.com, check which email the key sends to, or create a new key and replace the `access_key` value in `contact.html`.
- If sending fails, the form tells the visitor to email arpey@victimadvocacy.com instead.

## Before you announce the site

- [ ] Send a test inquiry through the contact form
- [x] Bruce Bealke's consent to be named (Services Agreement §10.3): confirmed
- [x] arpey@victimadvocacy.com receives mail: confirmed
- [ ] Have counsel approve the interim Terms and Privacy wording, including the refund terms for monthly support and impact statements
- [ ] Recheck the Privacy page's cookie section against your final host and form provider
- [ ] Add a business phone number to `contact.html` and the footer once you have one
- [ ] Once E&O insurance is in place, add an insurance answer to the FAQ on `attorneys.html`

## Hidden testimonials section

`index.html` has a "What Attorneys Say" section that is hidden on purpose. To turn it on:

1. Find `<section class="testimonials" hidden`.
2. Add one `<figure class="quote">…</figure>` per quote, following the example in the comment there.
3. Delete the word `hidden`.

Only use real quotes that each attorney has approved in writing.

## Making small edits

- **Text:** open the page's `.html` file in any text editor, change the words between the tags and save.
- **Colors:** edit the color values at the top of `theme.css` (`--aubergine`, `--plum`, `--gold` and so on).
- **Fonts:** Source Sans 3 and Playfair Display load from Google Fonts. The link is near the top of each page.
