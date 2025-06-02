CREATE MIGRATION m1uy3e22qouxqcmz7ppmjzikmu3myxmbsztxkmimh5uhl6mzsxb7kq
    ONTO initial
{
  CREATE FUTURE simple_scoping;
  CREATE TYPE default::article {
      CREATE REQUIRED PROPERTY body: std::str;
      CREATE REQUIRED PROPERTY createdAt: std::datetime;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY slug: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY title: std::str;
      CREATE REQUIRED PROPERTY updatedAt: std::datetime;
  };
  CREATE TYPE default::comment {
      CREATE REQUIRED PROPERTY articleSlug: std::str;
      CREATE REQUIRED PROPERTY body: std::str;
      CREATE REQUIRED PROPERTY commentId: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY createdAt: std::datetime;
      CREATE REQUIRED PROPERTY updatedAt: std::datetime;
  };
};
