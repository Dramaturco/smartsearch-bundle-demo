FROM nginx:alpine

#this removes the html files that are already in the nginx container
RUN rm /usr/share/nginx/html/*.html

#copies the html into the container
COPY . /usr/share/nginx/html

COPY ./config/env.template.js /env.template.js

CMD ["bin/sh", "-c", "envsubst '${SMARTSEARCH_URL},${SMARTSEARCH_PS}' < /env.template.js > /usr/share/nginx/html/config/env.js && exec nginx -g 'daemon off;'"]