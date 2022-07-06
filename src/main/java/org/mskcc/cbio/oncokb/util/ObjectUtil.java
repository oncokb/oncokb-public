package org.mskcc.cbio.oncokb.util;

import com.google.gson.Gson;

public class ObjectUtil {

    /**
     * Check if the object is empty or null. Object is empty if all fields are null.
     * @param <T> Type of the object
     * @param object object
     * @return true if object is empty
     */
    public static <T> boolean isObjectEmpty(T object) {
        if (object == null) {
            return true;
        }
        // Gson doesn't serialize null fields by default. If all fields are null, then a string representation of empty object is returned.
        String json = new Gson().toJson(object);
        return json.equals("{}");
    }
}
