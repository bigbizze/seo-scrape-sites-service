import os
import spur
import time
from dotenv import load_dotenv, dotenv_values

config = dotenv_values(".env")

os.system('git commit -a -m "automatic commit from build"')
git_address = "https://{username}:{token}@github.com/{username}/seo-scrape-sites.git".format(
    username=config["GIT_USERNAME"],
    token=config["GIT_TOKEN"]
)
import time; time.sleep(3)
os.system(f"git push {git_address}")

shell = spur.SshShell(
    hostname=config["SERVER_IP"],
    username=config["SERVER_USERNAME"],
    password=config["SERVER_PASSWORD"],
    missing_host_key=spur.ssh.MissingHostKey.accept
)
result = shell.run(["./update.sh", git_address])
print(result.output.decode("utf-8"))
