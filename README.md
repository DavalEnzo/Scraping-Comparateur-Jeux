# Comparateur de prix jeux-vidéo 🎮

Ce projet est une application web permettant de comparer les prix des jeux vidéo sur différentes plateformes.

Sites utilisé: G2A, Instant Gaming et Steam

## Fonctionnalités

- Recherche de jeux vidéo par nom
- Affichage des prix des jeux sur différentes plateformes
- Classement des plateformes par prix et disponibilité sous forme de podium

## Technologies utilisées

- **Frontend** : React, JavaScript, HTML, CSS
- **Backend** : Python, Flask
- **Autres** : Axios, Lottie, react-confetti, react-use

## Installation

### Prérequis

- Node.js et npm
- Python et pip

### Étapes

1. Clonez le dépôt :
    ```bash
    git clone https://github.com/DavalEnzo/Scraping-Comparateur-Jeux.git
    cd Scraping-Comparateur-Jeux
    ```

2. Installez les dépendances du frontend :
    ```bash
    cd front
    npm install
    ```

3. Installez les dépendances du backend :
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Sur Windows : .venv\Scripts\activate
    pip install -r requirements.txt
    ```

## Utilisation

### Démarrer le backend

1. Activez l'environnement virtuel :
    ```bash
    source .venv/bin/activate  # Sur Windows : .venv\Scripts\activate
    ```

2. Lancez le serveur Flask :
    ```bash
    flask --app .\selenium_scraping.py run
    ```

### Démarrer le frontend

1. Assurez-vous d'être dans le répertoire `front` :
    ```bash
    cd front
    ```

2. Lancez l'application React :
    ```bash
    npm start
    ```

3. Ouvrez votre navigateur et accédez à `http://localhost:3000`.

## Structure du projet

- `front/` : Contient le code source du frontend (React)
- `selenium_scrapping.py` : Contient le code source du backend (Flask)
- `.gitignore` : Fichier pour ignorer certains fichiers et répertoires dans Git