package org.mskcc.cbio.oncokb.service;

import io.sentry.Sentry;
import io.sentry.SentryEvent;
import io.sentry.SentryLevel;
import io.sentry.protocol.Message;
import io.sentry.protocol.User;
import org.springframework.stereotype.Service;

@Service
public class SentryService {

    /**
     * Send a message to Sentry
     *
     * @param sentryLevel Sentry event level. Warning, Error and more
     * @param message     The custom message which will be displayed in the Sentry issue
     * @param user        The optional user object if you want to group the issue based on the user
     */
    public void throwMessage(SentryLevel sentryLevel, String message, User user) {
        Sentry.setLevel(sentryLevel);
        if (user != null) {
            Sentry.setUser(user);
        }
        Sentry.captureMessage(message);
    }

    /**
     * Send the exception to Sentry
     *
     * @param sentryLevel Sentry event level. Warning, Error and more
     * @param exception   Any throwable exception which will be displayed in the Sentry issue
     * @param message     The custom message which will be displayed in the Sentry issue
     */
    public void throwEvent(SentryLevel sentryLevel, Throwable exception, String message) {
        SentryEvent event = new SentryEvent();
        Message sentryMessage = new Message();
        sentryMessage.setMessage(message);
        event.setMessage(sentryMessage);
        event.setLevel(sentryLevel);
        event.setThrowable(exception);

        Sentry.captureEvent(event);
    }
}
