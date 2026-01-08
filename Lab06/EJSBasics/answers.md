# 1. In one sentence: What does res.render(view, data) do?
Render the page on browser with html data in the file according to the file name of "view", and passing data as object to be used in that file.
# 2. What is the difference between <%= %> and <%- %>?
- \<\%\= \%\> Tells EJS to output the escaped output. Suitable for normal string output.
- \<%\- \%\> Tells EJS to output the included result as raw HTML
# 3. Where does Express look for EJS templates (folder path)?
"views" folder (root/views)