import nock from "nock";
import t from "tap";
import cli from "../src/cli.js";

t.beforeEach(async () => {
  nock.cleanAll();
});

t.test(
  "cli should create import uploading csv file then check progress until import is finished without errors",
  async (t) => {
    const postScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
        "content-type":
          "multipart/form-data; boundary=--------------------------515890814546601021194782",
      },
    })
      .post(
        "/imports",
        '----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="type"\r\n\r\ncontacts\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="delimiter"\r\n\r\n,\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="overrideExisting"\r\n\r\ntrue\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="updateOnlyEmptyFields"\r\n\r\nfalse\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="file"; filename="file.csv"\r\nContent-Type: text/csv\r\n\r\n_email,_name,_surname\njohn.doe@example.org,John,Doe\r\n----------------------------515890814546601021194782--\r\n'
      )
      .reply(200, { id: "6072374b4d3ceb76e44d4323", total: 1000 });

    const getScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
      },
    })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, { status: "inProgress", success: 500, errors: 0 })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, { status: "finished", success: 1000, errors: 0 });

    await cli().parseAsync([
      "node",
      "src/index.js",
      "-a",
      "myApiKey",
      "-t",
      "contacts",
      "-f",
      "./test/file.csv",
      "-i",
      "1",
    ]);
    t.equal(postScope.isDone(), true);
    t.equal(getScope.isDone(), true);
  }
);

t.test(
  "cli should create import uploading csv file then check progress until import is finished with errors",
  async (t) => {
    const postScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
        "content-type":
          "multipart/form-data; boundary=--------------------------515890814546601021194782",
      },
    })
      .post(
        "/imports",
        '----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="type"\r\n\r\ncontacts\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="delimiter"\r\n\r\n,\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="overrideExisting"\r\n\r\ntrue\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="updateOnlyEmptyFields"\r\n\r\nfalse\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="file"; filename="file.csv"\r\nContent-Type: text/csv\r\n\r\n_email,_name,_surname\njohn.doe@example.org,John,Doe\r\n----------------------------515890814546601021194782--\r\n'
      )
      .reply(200, { id: "6072374b4d3ceb76e44d4323", total: 1000 });

    const getScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
      },
    })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, { status: "inProgress", success: 500, errors: 0 })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, {
        status: "finished",
        success: 900,
        errors: 100,
        errorReportFileUrl: "https://site.com/error-report.csv",
      });

    await cli().parseAsync([
      "node",
      "src/index.js",
      "-a",
      "myApiKey",
      "-t",
      "contacts",
      "-f",
      "./test/file.csv",
      "-i",
      "1",
    ]);
    t.equal(postScope.isDone(), true);
    t.equal(getScope.isDone(), true);
  }
);

t.test(
  "cli should create import uploading csv file then throw an error if import finished in error state",
  async (t) => {
    const postScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
        "content-type":
          "multipart/form-data; boundary=--------------------------515890814546601021194782",
      },
    })
      .post(
        "/imports",
        '----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="type"\r\n\r\ncontacts\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="delimiter"\r\n\r\n,\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="overrideExisting"\r\n\r\ntrue\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="updateOnlyEmptyFields"\r\n\r\nfalse\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="file"; filename="file.csv"\r\nContent-Type: text/csv\r\n\r\n_email,_name,_surname\njohn.doe@example.org,John,Doe\r\n----------------------------515890814546601021194782--\r\n'
      )
      .reply(200, { id: "6072374b4d3ceb76e44d4323", total: 1000 });

    const getScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
      },
    })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, { status: "inProgress", success: 500, errors: 0 })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, { status: "error", success: 500, errors: 0 });

    try {
      await cli().parseAsync([
        "node",
        "src/index.js",
        "-a",
        "myApiKey",
        "-t",
        "contacts",
        "-f",
        "./test/file.csv",
        "-i",
        "1",
      ]);
      t.fail("should not execute this");
    } catch (error) {
      t.equal(error.message, "import finished in error state");
      t.equal(postScope.isDone(), true);
      t.equal(getScope.isDone(), true);
    }
  }
);

t.test(
  "cli should throw error if got an api response error while creating import",
  async (t) => {
    const postScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
        "content-type":
          "multipart/form-data; boundary=--------------------------515890814546601021194782",
      },
    })
      .post(
        "/imports",
        '----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="type"\r\n\r\ncontacts\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="delimiter"\r\n\r\n,\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="overrideExisting"\r\n\r\ntrue\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="updateOnlyEmptyFields"\r\n\r\nfalse\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="file"; filename="file.csv"\r\nContent-Type: text/csv\r\n\r\n_email,_name,_surname\njohn.doe@example.org,John,Doe\r\n----------------------------515890814546601021194782--\r\n'
      )
      .reply(401, "Unauthorized");

    try {
      await cli().parseAsync([
        "node",
        "src/index.js",
        "-a",
        "myApiKey",
        "-t",
        "contacts",
        "-f",
        "./test/file.csv",
        "-i",
        "1",
      ]);
      t.fail("should not execute this");
    } catch (error) {
      t.equal(error.message, "401 - Unauthorized");
      t.equal(postScope.isDone(), true);
    }
  }
);

t.test(
  "cli should throw error if got an api response error while checking import progress",
  async (t) => {
    const postScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
        "content-type":
          "multipart/form-data; boundary=--------------------------515890814546601021194782",
      },
    })
      .post(
        "/imports",
        '----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="type"\r\n\r\ncontacts\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="delimiter"\r\n\r\n,\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="overrideExisting"\r\n\r\ntrue\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="updateOnlyEmptyFields"\r\n\r\nfalse\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="file"; filename="file.csv"\r\nContent-Type: text/csv\r\n\r\n_email,_name,_surname\njohn.doe@example.org,John,Doe\r\n----------------------------515890814546601021194782--\r\n'
      )
      .reply(200, { id: "6072374b4d3ceb76e44d4323", total: 1000 });

    const getScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
      },
    })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(401, "Unauthorized");

    try {
      await cli().parseAsync([
        "node",
        "src/index.js",
        "-a",
        "myApiKey",
        "-t",
        "contacts",
        "-f",
        "./test/file.csv",
        "-i",
        "1",
      ]);
      t.fail("should not execute this");
    } catch (error) {
      t.equal(error.message, "401 - Unauthorized");
      t.equal(postScope.isDone(), true);
      t.equal(getScope.isDone(), true);
    }
  }
);

t.test("cli should throw error if file does not exists", async (t) => {
  try {
    await cli().parseAsync([
      "node",
      "src/index.js",
      "-a",
      "myApiKey",
      "-t",
      "contacts",
      "-f",
      "./test/file-that-does-not-exists.csv",
      "-i",
      "1",
    ]);
    t.fail("should not execute this");
  } catch (error) {
    t.equal(
      error.message,
      "file ./test/file-that-does-not-exists.csv does not exist"
    );
  }
});

t.test(
  "cli should send in formData couponSetId when set in options",
  async (t) => {
    const postScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
        "content-type":
          "multipart/form-data; boundary=--------------------------515890814546601021194782",
      },
    })
      .post(
        "/imports",
        '----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="type"\r\n\r\ncoupons\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="delimiter"\r\n\r\n,\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="overrideExisting"\r\n\r\ntrue\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="updateOnlyEmptyFields"\r\n\r\nfalse\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="couponSetId"\r\n\r\n61fa54f238319b3bf1990fdc\r\n----------------------------515890814546601021194782\r\nContent-Disposition: form-data; name="file"; filename="file.csv"\r\nContent-Type: text/csv\r\n\r\n_email,_name,_surname\njohn.doe@example.org,John,Doe\r\n----------------------------515890814546601021194782--\r\n'
      )
      .reply(200, { id: "6072374b4d3ceb76e44d4323", total: 1000 });

    const getScope = nock("https://api.connectif.cloud", {
      reqheaders: {
        authorization: "apiKey myApiKey",
      },
    })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, { status: "inProgress", success: 500, errors: 0 })
      .get("/imports/6072374b4d3ceb76e44d4323")
      .reply(200, { status: "finished", success: 1000, errors: 0 });

    await cli().parseAsync([
      "node",
      "src/index.js",
      "-a",
      "myApiKey",
      "-t",
      "coupons",
      "-c",
      "61fa54f238319b3bf1990fdc",
      "-f",
      "./test/file.csv",
      "-i",
      "1",
    ]);
    t.equal(postScope.isDone(), true);
    t.equal(getScope.isDone(), true);
  }
);
