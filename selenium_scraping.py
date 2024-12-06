import threading
import time

from flask import Flask, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

app = Flask(__name__)
CORS(app)

def scrape_g2a(input_name, results):
    options = webdriver.FirefoxOptions()
    options.set_preference('permissions.default.image', 2)
    options.add_argument("--headless")
    driver = webdriver.Firefox(options=options)
    try:
        driver.get(f'https://www.g2a.com/fr/search?query={input_name}')
        WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.XPATH, "//*/ul[@class='sc-hzUIXc indexes__StyledListMobile-wklrsw-108 jSTRnN bOAxJc']/li"))
        )
        game_name = driver.find_element(By.XPATH, "//*/ul[@class='sc-hzUIXc indexes__StyledListMobile-wklrsw-108 jSTRnN bOAxJc']").find_element(
            By.TAG_NAME, 'li').get_attribute('name')
        price = driver.find_element(By.XPATH, "//*/span[@data-locator='zth-price']").text.replace('€ ', '').replace(',', '.')
        url = driver.find_element(By.XPATH, "//*/h3[@class='sc-crzoAE sc-bqGGPW inDMqh ifeSiB sc-csTbgd icrCIn']/a").get_attribute('href')
        results['g2a'] = {"name": game_name, "price": float(price), "url": url}
    except Exception as e:
        results['g2a'] = {"name": None, "price": 0, "url": None}
    finally:
        driver.quit()

def scrape_instant_gaming(input_name, results):
    options = webdriver.FirefoxOptions()
    options.add_argument("--headless")
    options.set_preference('permissions.default.image', 2)
    driver = webdriver.Firefox(options=options)
    try:
        driver.get('https://www.instant-gaming.com/fr/')
        search_box = driver.find_element(By.TAG_NAME, 'input')
        search_box.send_keys(input_name)
        WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.XPATH, "//div[@class='information']/div[@class='price']"))
        )
        price = driver.find_element(By.XPATH, "//div[@class='information']/div[@class='price']").text.replace('€', '').replace(',', '.')
        url = driver.find_element(By.XPATH, "//a[@class='cover video']").get_attribute('href')
        results['instant_gaming'] = {"price": float(price), "url": url}
    except Exception as e:
        results['instant_gaming'] = {"price": 0, "url": None}
    finally:
        driver.quit()

def scrape_steam(input_name, results):
    options = webdriver.FirefoxOptions()
    options.add_argument("--headless")
    options.set_preference('permissions.default.image', 2)
    driver = webdriver.Firefox(options=options)
    try:
        driver.get('https://store.steampowered.com/')
        search_box = driver.find_element(By.ID, 'store_nav_search_term')
        search_box.send_keys(input_name)
        WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'match_subtitle'))
        )
        price = driver.find_element(By.CLASS_NAME, 'match_subtitle').text.replace('€', '').replace(',', '.')
        url = driver.find_element(By.XPATH, "//a[contains(@class, 'match match_app match_v2')]").get_attribute('href')
        results['steam'] = {"price": float(price), "url": url}
    except Exception as e:
        results['steam'] = {"price": 0, "url": None}
    finally:
        driver.quit()

@app.route("/<name>", methods=['GET'])
def scrap(name):
    start_time = time.time()
    input_name = name
    results = {}

    # Create threads
    threads = [
        threading.Thread(target=scrape_g2a, args=(input_name, results)),
        threading.Thread(target=scrape_instant_gaming, args=(input_name, results)),
        threading.Thread(target=scrape_steam, args=(input_name, results)),
    ]

    # Start threads
    for thread in threads:
        thread.start()

    # Wait for all threads to finish
    for thread in threads:
        thread.join()

    # Process results
    filtered_results = {k: v for k, v in results.items() if v['price'] > 0}
    if not filtered_results:
        return jsonify({
            "message": "No games found",
            "time_taken": round(time.time() - start_time, 2)
        })

    sorted_prices = sorted(
        [(k, v['price']) for k, v in filtered_results.items()],
        key=lambda x: float(x[1])  # Ensure price is treated as float
    )

    if len(sorted_prices) >= 3:
        ranking = {sorted_prices[0][0]: 2, sorted_prices[1][0]: 1, sorted_prices[2][0]: 3}
    elif len(sorted_prices) == 2:
        ranking = {sorted_prices[0][0]: 2, sorted_prices[1][0]: 1}
    elif len(sorted_prices) == 1:
        ranking = {sorted_prices[0][0]: 2}
    else:
        ranking = {}

    return jsonify({
        "game": results.get("g2a", {}).get("name", "Inconnu"),
        "ranking": ranking,
        "results": results,
        "time_taken": round(time.time() - start_time, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)
