import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Simple Queries", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("05", "06");
  }, minutes(3));

  it(
    "should select total budget and revenue from movies, by using adjusted financial data",
    async done => {
      const query = `
      SELECT round(sum(budget_adjusted),2) AS total_budget,
      round(sum(revenue_adjusted),2) AS total_revenue 
      FROM movies
      `;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        total_budget: 190130349695.48,
        total_revenue: 555818960433.08
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select count from movies where budget was more than 100000000 and release date after 2009",
    async done => {
      const query = `
      SELECT count(*) AS count
      FROM movies
      WHERE budget > 100000000 and datetime(release_date) > Datetime('2009')
      `;
      const result = await db.selectSingleRow(query);

      expect(result.count).toBe(282);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three movies order by budget where release data is after 2009",
    async done => {
      const query = `
      SELECT original_title, budget, revenue
      FROM movies
      WHERE datetime(release_date) > Datetime('2009')
      ORDER BY budget desc
      LIMIT 3
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          original_title: "The Warrior's Way",
          budget: 425000000.0,
          revenue: 11087569.0
        },
        {
          original_title: "Pirates of the Caribbean: On Stranger Tides",
          budget: 380000000.0,
          revenue: 1021683000.0
        },
        {
          original_title: "Pirates of the Caribbean: At World's End",
          budget: 300000000.0,
          revenue: 961000000.0
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of movies where homepage is secure (starts with https)",
    async done => {
      const query = `
      SELECT count(*) AS count
      FROM movies
      WHERE homepage like "https%"
      `;
      const result = await db.selectSingleRow(query);

      expect(result.count).toBe(82);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of movies released every year",
    async done => {
      const query = `
      SELECT SUBSTR(release_date, 1, 4) AS year, count(1) AS count
      FROM movies
      GROUP BY year
      ORDER BY year DESC
      `;
      const result = await db.selectMultipleRows(query);

      expect(result.length).toBe(56);
      expect(result.slice(0, 3)).toEqual([
        {
          count: 627,
          year: "2015"
        },
        {
          count: 696,
          year: "2014"
        },
        {
          count: 656,
          year: "2013"
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three users which left most ratings",
    async done => {
      const query = `
      SELECT user_id, count(1) AS count
      FROM movie_ratings
      GROUP BY user_id
      ORDER BY count desc
      LIMIT 3
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          user_id: 8659,
          count: 349
        },
        {
          user_id: 179792,
          count: 313
        },
        {
          user_id: 107720,
          count: 294
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select count of ratings left each month",
    async done => {
      const query = `
      SELECT SUBSTR(time_created, 6, 2) AS month, count(1) AS count
      FROM movie_ratings
      GROUP BY month
      ORDER BY count desc;
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          count: 161252,
          month: "11"
        },
        {
          count: 146804,
          month: "12"
        },
        {
          count: 144545,
          month: "07"
        },
        {
          count: 141643,
          month: "10"
        },
        {
          count: 136058,
          month: "06"
        },
        {
          count: 131934,
          month: "01"
        },
        {
          count: 130411,
          month: "05"
        },
        {
          count: 129070,
          month: "03"
        },
        {
          count: 127299,
          month: "08"
        },
        {
          count: 119368,
          month: "04"
        },
        {
          count: 108811,
          month: "02"
        },
        {
          count: 103819,
          month: "09"
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three movies with most ratings",
    async done => {
      const query = `
      SELECT user_id, count(1) AS count
      FROM movie_ratings
      GROUP BY user_id
      ORDER BY count desc
      LIMIT 3
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          user_id: 8659,
          count: 349
        },
        {
          user_id: 179792,
          count: 313
        },
        {
          user_id: 107720,
          count: 294
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select actors whose name starts with 'T' and ends with 'M' and surname starts with 'H' and ends with 'S'",
    async done => {
      const query = `
      SELECT full_name AS name_surname
      FROM actors
      WHERE full_name LIKE 'T%M H%S'
      `;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          name_surname: 'Tom Hanks'
        },
        {
          name_surname: 'Tim Hands'
        },
        {
          name_surname: 'Tom Hughes'
        },
        {
          name_surname: 'Tom Hodgkins'
        },
        {
          name_surname: 'Tom Hodges'
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top five longest running movies in format (H : M))",
    async done => {
      const query = `
      SELECT (runtime / 60) || ' : ' || (runtime - (runtime / 60 * 60 )) AS runtime_hours, original_title AS title
      FROM movies
      ORDER BY runtime DESC
      LIMIT 5
      `;
      const result = await db.selectMultipleRows(query);

      console.log(db.selectMultipleRows(query));
      expect(result).toEqual([
        {
          runtime_hours: '15 : 0',
          title: 'The Story of Film: An Odyssey'
        },
        {
          runtime_hours: '14 : 37',
          title: 'Taken'
        },
        {
          runtime_hours: '11 : 45',
          title: 'Band of Brothers'
        },
        {
          runtime_hours: '9 : 26',
          title: 'Shoah'
        },
        {
          runtime_hours: '9 : 21',
          title: 'North and South, Book I'
        }
      ]);

      done();
    },
    minutes(3)
  );
});
