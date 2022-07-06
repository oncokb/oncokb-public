package org.mskcc.cbio.oncokb.util;

import org.junit.jupiter.api.Test;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Test class for the {@link ObjectUtil} utility class.
 */
public class ObjectUtilUnitTest {
    
    @Test
    public void isObjectEmpty() {
        Person person = new Person();
        assertTrue(ObjectUtil.isObjectEmpty(null));
        assertTrue(ObjectUtil.isObjectEmpty(person));

        person.setName("Name");
        assertFalse(ObjectUtil.isObjectEmpty(person));

        assertFalse(ObjectUtil.isObjectEmpty(""));
    }

    class Person {
        String name;
    
        public String getName() {
            return this.name;
        }
    
        public void setName(String name) {
            this.name = name;
        }
        
    }

}
