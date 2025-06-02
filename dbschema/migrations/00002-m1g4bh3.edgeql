CREATE MIGRATION m1g4bh3vv3se2vhhryjxsgmvu6l2atoibmb63mnfmprn2qbo7zqmra
    ONTO m1uy3e22qouxqcmz7ppmjzikmu3myxmbsztxkmimh5uhl6mzsxb7kq
{
  ALTER TYPE default::article {
      CREATE INDEX ON (.slug);
  };
  ALTER TYPE default::comment {
      CREATE REQUIRED LINK article: default::article {
          SET REQUIRED USING (SELECT
              default::article FILTER
                  (default::article.slug = default::comment.articleSlug)
          LIMIT
              1
          );
      };
      CREATE INDEX ON (.commentId);
  };
  ALTER TYPE default::article {
      CREATE MULTI LINK comments := (.<article[IS default::comment]);
  };
  ALTER TYPE default::comment {
      DROP PROPERTY articleSlug;
  };
};
