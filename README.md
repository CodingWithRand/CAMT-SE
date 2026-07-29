# A generic blog web app
I planned to add more features in the future. But this is the base template from individual assignment of the course 953621, CAMT, CMU.
## Stacks
- Vanilla HTML, CSS, JavaScript (bundled with esbuild) for frontend.
- TypeScript, Node.js, Express.js, EJS (SSR) for backend.
- Supabase for database

Disclaimer: This project is 50% vibe coded (The UI)

## Current Features (v2.0.0)
- Starter landing page -> featuring most popular/favorited blogs, and latest blogs.
- Registration -> Email, and Google Provider. Offer reset password in case forgot.
- Blog feed -> load 3 public blogs each time user scroll to the bottom.
- Blog & People search -> suggest searching loaded blogs and their author when typing keywords, and load the search result blog with given keywords.
- Blog card -> represent a blog with title and description. Also includes its metadata: like count, comment count, and **save blog** button. This load on the blog feed
- Save blog -> save the blog for later, you can view your saved blogs in "Saved Posts" menu.
- Blog page -> feature blog title, blog description, blog author and their profile, blog content, like and save blog button, and **comment section**
- Comment section -> post your comment, reply to your own or other's comment, and like comments and replies. Comments are deletable but it's *Reddit-like* deletion.
- Compose -> write your blog with rich text editor from [Quill](https://quilljs.com/). You can make the blog public, unlisted or private, and you can also allow comment on the blog or not.
- User profile page -> featuring user's blog posts (unlisted and private blogs are shown to their own page), user's about text, user's profile picture and banner, and number of blogs posted.
- Account settings -> Overall profile config: profile picture, display name, about text (bio), password change, and account deletion.
- Preference -> change theme, language (TH or EN for now), font family, font size, privacy: public profile and allow comments on your blog by default. 

## Next Sprint Features
- Blog's tag and tag search
- Group and group only blogs (visibility set to only people in the group to be able to view the blog).
- Rendering youtube video when youtube link is detected (through iframe)

# Versions
## v1.0.0
Pretty much what I submitted to professor. This version is long gone...

This is what it looked like. Pretty simple.
![](./Screenshots/Homepage.png)

## v2.0.0
Completely rebranded blog that works in the real world and deployed to ~~[Render](https://render.com)~~ [Vercel](https://vercel.com)

Visit here: [https://whiskey-black.vercel.app/](https://whiskey-black.vercel.app/)

I tried docker. Here is the take away.
- `.devcontainer` is for deving and testing, use with vscode. features are optional.
- to push to docker hub, build one by yourself with [dockerfile](./dockerfile) as a config.
```bash
# Build command (docker build -t image_name dockerfile_lookup_dir)
docker build -t rand0mtutorial/camt-se-blog-web:latest .
# Run command (docker run -p host_port:in_container_using_port image_name)
docker run -p 3000:3000 rand0mtutorial/camt-se-blog-web:latest
# Publish to docker hub (Soon)
```