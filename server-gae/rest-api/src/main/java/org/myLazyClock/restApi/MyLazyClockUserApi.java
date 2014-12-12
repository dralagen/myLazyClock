/*
 * myLazyClock
 *
 * Copyright (C) 2014
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.myLazyClock.restApi;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.memcache.ErrorHandlers;
import com.google.appengine.api.memcache.Expiration;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.users.User;
import org.myLazyClock.services.ConstantAPI;
import org.myLazyClock.services.MyLazyClockUserService;
import org.myLazyClock.services.bean.MyLazyClockUserValid;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;

/**
 * Created on 08/12/14.
 *
 * @author dralagen
 */
@Api(
        name = Constants.NAME,
        version = Constants.VERSION,
        clientIds = { Constants.WEB_CLIENT_ID},
        scopes = { Constants.SCOPE_EMAIL, Constants.SCOPE_CALENDAR_READ }
)
public class MyLazyClockUserApi {

    private MemcacheService getMemcacheService() {
        MemcacheService cache = MemcacheServiceFactory.getMemcacheService("myLazyClockUserCheckToken");
        cache.setErrorHandler(ErrorHandlers.getConsistentLogAndContinue(Constants.MEMCACHE_LEVEL_ERROR_HANDLERS));
        return cache;
    }

    @ApiMethod(name = "myLazyClockUser.link", httpMethod = ApiMethod.HttpMethod.POST, path = "myLazyClockUser")
    public MyLazyClockUserValid linkUser(@Named("code") String code, User user) throws UnauthorizedException, GeneralSecurityException, IOException {
        if (user == null) {
            throw new UnauthorizedException("Login Required");
        }

        HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport,
                jsonFactory,
                ConstantAPI.API_ID,
                ConstantAPI.API_SECRET,
                Arrays.asList(Constants.SCOPE_CALENDAR_READ)
        ).build();

        GoogleTokenResponse response=flow.newTokenRequest(code).setRedirectUri("postmessage").execute();

        MyLazyClockUserValid isValid = MyLazyClockUserService.getInstance().add(user, response.getRefreshToken());

        getMemcacheService().delete(user);

        return isValid;
    }

    @ApiMethod(name = "myLazyClockUser.get", httpMethod = ApiMethod.HttpMethod.GET, path = "myLazyClockUser")
    public MyLazyClockUserValid CheckValid(User user) throws UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Login Required");
        }

        MyLazyClockUserValid isValid;
        MemcacheService cache = getMemcacheService();

        try {
            isValid = (MyLazyClockUserValid) cache.get(user);
            if (isValid != null) {
                return isValid;
            }
        } catch (Exception ignore) { }

        isValid = MyLazyClockUserService.getInstance().checkValid(user.getUserId());

        try {
            cache.put(user, isValid, Expiration.byDeltaSeconds(21600)); // 6H
        } catch (Exception ignore) {}

        return isValid;
    }
}
