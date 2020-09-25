import { OnVendureBootstrap, PluginCommonModule, RuntimeVendureConfig, VendurePlugin } from '@vendure/core';

import { INestApplication, Type } from '@nestjs/common';
import { json } from 'body-parser';

import cloneBuffer from 'clone-buffer';
import { stripePaymentMethodHandler } from './stripe-payment-methods';
import * as http from 'http';
import { RawBodyIncomingMessage } from './interfaces';

/**
 * This plugin implements the Stripe (https://www.stripe.com/) payment provider.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [],

    configuration: (config: RuntimeVendureConfig) => {
        config.paymentOptions.paymentMethodHandlers.push(stripePaymentMethodHandler);
        return config;
    },
})
export class StripePlugin implements OnVendureBootstrap {
    static beforeVendureBootstrap(app: INestApplication): void | Promise<void> {
        // https://yanndanthu.github.io/2019/07/04/Checking-Stripe-Webhook-Signatures-from-NestJS.html
        app.use(
            json({
                verify(req: RawBodyIncomingMessage, res: http.ServerResponse, buf: Buffer) {
                    if (req.headers['stripe-signature'] && Buffer.isBuffer(buf)) {
                        req.rawBody = cloneBuffer(buf);
                    }
                    return true;
                },
            }),
        );
    }

    async onVendureBootstrap(): Promise<void> {
        // nothing to see here.
    }
}
