package com.provectus.kafka.ui.steps.kafka.schemasteps;

import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.Pages;
import com.provectus.kafka.ui.pages.schema.SchemaRegistryList;
import com.provectus.kafka.ui.pages.schema.SchemaView;
import com.provectus.kafka.ui.tests.SchemasTests;
import io.qase.api.annotation.Step;

import java.io.IOException;
import java.util.function.Supplier;

import static com.provectus.kafka.ui.steps.kafka.schemasteps.SchemaConstance.SCHEMA_AVRO_API_UPDATE;
import static com.provectus.kafka.ui.steps.kafka.schemasteps.SchemaConstance.SECOND_LOCAL;
import static org.apache.kafka.common.utils.Utils.readFileAsString;


public class SchemaSteps extends Pages {
    public static final SchemaSteps INSTANCE = new SchemaSteps();
    public static SchemasTests schemasTests = new SchemasTests();
    public static MainPage mainPage = new MainPage();

    private SchemaSteps() {}

    @Step("Open page schema")
    public void openPage(MainPage.SideMenuOptions sideMenuOptions) throws IllegalArgumentException {
        openMainPage()
                .goToSideMenu(SECOND_LOCAL, sideMenuOptions);
    }

    @Step("Create schema")
    public static SchemaSteps createSchema(Supplier<SchemaView> schemaType) {
        schemaType.get();
        return INSTANCE;
    }

    @Step("Is on schema view page")
    public void isOnSchemaPage() {
        schemaView.isOnSchemaViewPage();
    }

    @Step("Is schema visible")
    public void isSchemaVisible(String schemaName) {
        schemaRegistry.isSchemaVisible(schemaName);
    }

    @Step("Update schema avro")
    public static void updateSchemaAvro(String schemaAvroApiUpdate, String pathAvroForUpdate) throws IOException {
        new SchemaRegistryList().openSchema(SCHEMA_AVRO_API_UPDATE)
                .openEditSchema()
                .selectCompatibilityLevelFromDropdown(CompatibilityLevel.CompatibilityEnum.NONE)
                .setNewSchemaValue(readFileAsString(pathAvroForUpdate))
                .clickSubmit()
                .isCompatibility(CompatibilityLevel.CompatibilityEnum.NONE);
        new SchemaSteps();
    }

    @Step("Delete schema with type")
    public static void deleteSchema(String schemaAvroApi) {
        Pages.INSTANCE.schemaRegistry
                .openSchema(schemaAvroApi)
                .removeSchema();
    }

    @Step("Schema is not visible")
    public static boolean schemaIsNotVisible(String schemaAvroApi) {
        return Pages.INSTANCE.schemaRegistry
                .isNotVisible(schemaAvroApi);
    }
}
