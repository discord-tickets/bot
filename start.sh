#!/bin/sh
echo "Lancement du postinstall pour la configuration de Prisma"
node ./scripts/preinstall
node ./scripts/postinstall
echo "Démarrage de Ticket Tool"
npm start