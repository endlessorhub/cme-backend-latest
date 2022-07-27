FROM cme/app-base

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3005

EXPOSE ${PORT}
CMD [ "/home/node/app/apps/blockchain-ms/bin/boot" ]
