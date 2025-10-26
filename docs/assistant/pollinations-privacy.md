# Pollinations browser privacy note

The `/assistant` prototype calls Pollinations directly from the browser when it uses the default `PUBLIC_ASSISTANT_API_URL`. Each request shares your IP address, referrer, and user agent with Pollinations, so treat conversations as public traffic. If you need stronger privacy guarantees, proxy the requests through infrastructure you control or disable the assistant entirely.
