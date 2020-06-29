#!/bin/bash
#---------------------------------------------------------
# written by: Lawrence McDaniel
#             lpm0073@gmail.com
#             lawrencemcdaniel.com
#
# date:       June-2020
#
# usage:      deploy prouduction build to AWS S3 bucket.
#
#             https://gist.github.com/kellyrmilligan/e242d3dc743105fe91a83cc933ee1314
# 
#             1. Build the React application
#             2. Upload to AWS S3
#             3. Invalidate all items in the AWS Cloudfront CDN.
#---------------------------------------------------------
cd /Users/mcdaniel/github/lpm0073/adaptiveselection
yarn build
cd /Users/mcdaniel/github/lpm0073/adaptiveselection

# ------------------------
# add all built files to the S3 bucket.
# ------------------------
aws s3 sync ./build/ s3://adaptiveselection \
            --acl public-read \
            --delete --cache-control max-age=31536000,public \
            --expires '31 Dec 2030 00:00:01 GMT'

# ------------------------
# remove the cache-control header created above with a "no-cache" header so that browsers never cache this page
# ------------------------
aws s3 cp s3://adaptiveselection/service-worker.js s3://adaptiveselection/service-worker.js --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type application/javascript --acl public-read
aws s3 cp s3://adaptiveselection/index.html s3://adaptiveselection/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read
aws s3 cp s3://adaptiveselection/asset-manifest.json s3://adaptiveselection/asset-manifest.json --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read
aws s3 cp s3://adaptiveselection/manifest.json s3://adaptiveselection/manifest.json --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read

# invalidate the Cloudfront cache
aws cloudfront create-invalidation \
              --distribution-id EG4L3BLEDDXSR \
              --paths "/*" "/index.html"
