import os
import time
import logging

#web module
import tornado.web
import Settings
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.options import define, options
from tornado.web import Application,RequestHandler

# rules module
import repository as repo
from engine import Engine

# server module
import json
import pandas as pd
import numpy as np
from io import BytesIO
from PIL import Image

os.environ['OMP_THREAD_LIMIT'] = '4'

log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
logging.basicConfig(level=logging.INFO, format=log_fmt)

class HtmlPageHandler(RequestHandler):
    def get(self):
        print('======= GET REQUEST =======')

        self.render('index.html')

class GetData(RequestHandler):
    def post(self):
        print('======= POST REQUEST =======')
        logger = logging.getLogger(__name__)

        if len(self.request.files) == 0 :
            self.render('index.html')
            return

        result = {}
        start = time.time()

        try:
            template_id = int(self.get_body_argument('form_id', default=None, strip=False))
            img_file = self.request.files['file'][0]['body']
            img_bytes = BytesIO(img_file)
            img = Image.open(img_bytes)

        except ValueError:
            raise ValueError('Value needs to be from 0-2')

        logger.info('======= ENGINE START =======')

        result = Engine.engine(
            template_id=template_id,
            image=img,
            resize_image=False,
            units=False,
            status=True,
            split=True,
            multipage=False,
            verbose=False
        )
        logger.info('======= ENGINE END =======')
        logger.info(f'Total time: {time.time() - start}s')

        self.write(result)

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/', HtmlPageHandler),
            (r'/static/(.*)', tornado.web.StaticFileHandler, {'path': './static'}),
            (r'/submit', GetData)
        ]
        settings = {
            'template_path': Settings.TEMPLATE_PATH,
            'static_path': Settings.STATIC_PATH,
            'debug': Settings.DEBUG,
            'xsrf_cookies': False,
        }
        tornado.web.Application.__init__(self, handlers, **settings)

def make_app():
    return tornado.httpserver.HTTPServer(Application())

if __name__ == '__main__':
    repo.init_apps()

    app =  make_app()
    app.listen(7655)
    print('Tornado is Running')
    IOLoop.current().start()
