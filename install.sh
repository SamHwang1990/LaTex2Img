#! /bin/sh

mkdir ./tmp;
curl "http://apache.01link.hk/xmlgraphics/batik/binaries/batik-1.7.1.tar.gz" -o "./tmp/batik-1.7.1.tar.gz";
npm install;
tar -xzf ./tmp/batik-1.7.1.tar.gz -C ./tmp/;
cp ./tmp/batik-1.7.1/batik-rasterizer.jar ./node_modules/MathJax-node/batik/;
cp -R ./tmp/batik-1.7.1/lib ./node_modules/MathJax-node/batik/;
rm -rf ./tmp/;

exit 0;


