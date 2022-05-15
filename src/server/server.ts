import { ServerPromiseResp } from '@project-error/pe-utils';
import {
  AccountEvents,
  ExternalAccountEvents,
  InvoiceEvents,
  SharedAccountEvents,
  TransactionEvents,
  UserEvents,
} from '@typings/Events';
import './globals.server';

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { RequestHandler } from 'express';
import 'reflect-metadata';

/* Create associations after the models etc */
import './services/associations';
import { Bank } from './services/Bank';
import './services/controllers';
import './utils/i18n';
import { load } from './utils/i18n';
import './utils/pool';
import './utils/server-config';
import { mainLogger } from './sv_logger';
import { mockedResourceName } from './globals.server';
import { config } from './utils/server-config';
import { UserService } from './services/user/user.service';
import { container } from 'tsyringe';

const hotReloadConfig = {
  resourceName: GetCurrentResourceName(),
  files: ['/src/dist/server.js', '/src/dist/client.js', '/src/dist/html/index.js'],
};

if (GetResourceState('hotreload') === 'started') {
  exports['hotreload']?.add?.(hotReloadConfig);
}

new Bank().bootstrap();

const isMocking = process.env.NODE_ENV === 'mocking';
type BaseData = {
  data: unknown;
};

const createEndpoint = (eventName: string): [string, RequestHandler] => {
  const endpoint = `/${eventName.replace(':', '-')}`;
  const responseEventName = `${eventName}-response`;

  return [
    endpoint,
    async (req, res) => {
      emitNet(eventName, responseEventName, req.body);
      const result = await new Promise((resolve) => {
        onNet(responseEventName, (_source: number, data: ServerPromiseResp<BaseData>) => {
          resolve(data);
        });
      });

      return res.send(result);
    },
  ];
};

if (isMocking) {
  const app = express();
  const port = 3005;
  app.use(cors());
  app.use(bodyParser.json());

  app.post('/', (_req, res) => {
    res.send('This is a mocked version of the Fivem Server. Available endpoints are unknown :p');
  });

  app.post(...createEndpoint(UserEvents.GetUsers));
  app.post(...createEndpoint(AccountEvents.GetAccounts));
  app.post(...createEndpoint(AccountEvents.DeleteAccount));
  app.post(...createEndpoint(AccountEvents.SetDefaultAccount));
  app.post(...createEndpoint(AccountEvents.CreateAccount));
  app.post(...createEndpoint(AccountEvents.RenameAccount));
  app.post(...createEndpoint(AccountEvents.WithdrawMoney));
  app.post(...createEndpoint(AccountEvents.DepositMoney));
  app.post(...createEndpoint(TransactionEvents.Get));
  app.post(...createEndpoint(TransactionEvents.CreateTransfer));
  app.post(...createEndpoint(TransactionEvents.GetHistory));
  app.post(...createEndpoint(InvoiceEvents.Get));
  app.post(...createEndpoint(InvoiceEvents.CreateInvoice));
  app.post(...createEndpoint(InvoiceEvents.PayInvoice));
  app.post(...createEndpoint(SharedAccountEvents.AddUser));
  app.post(...createEndpoint(SharedAccountEvents.RemoveUser));
  app.post(...createEndpoint(SharedAccountEvents.GetUsers));
  app.post(...createEndpoint(ExternalAccountEvents.Add));
  app.post(...createEndpoint(ExternalAccountEvents.Get));

  app.listen(port, async () => {
    mainLogger.child({ module: 'server' }).debug(`[MOCKSERVER]: listening on port: ${port}`);

    emit('onServerResourceStart', mockedResourceName);
    global.source = 2;

    /* Load user with framework Integration */
    if (config.frameworkIntegration?.enabled) {
      const service = container.resolve(UserService);

      service.loadPlayer({
        source: 3,
        name: 'John Doe',
        identifier: 'custom-character-identifier:john-doe',
      });
    }
  });
}

load();
