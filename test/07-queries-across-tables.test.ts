import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("06", "07");
    }, minutes(3));

    it(
        "should select top three directors ordered by total budget spent in their movies",
        async done => {
            const query = `
            SELECT round(sum(m.budget_adjusted), 2) AS total_budget, d.full_name AS director
            FROM movies m
            JOIN movie_directors md ON md.movie_id = m.id
            JOIN directors d ON d.id = md.director_id
            GROUP BY d.full_name
            ORDER BY total_budget desc
            LIMIT 3
            `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    director: "Steven Spielberg",
                    total_budget: 2173663066.68
                },
                {
                    director: "Ridley Scott",
                    total_budget: 1740157354.14
                },
                {
                    director: "Michael Bay",
                    total_budget: 1501996071.5

                }
            ]);
            done();
        },
        minutes(3)
    );

    it(
        "should select top 10 keywords ordered by their appearance in movies",
        async done => {
            const query = `
            SELECT count(*) AS count, k.keyword as keyword
            FROM movies m
            JOIN movie_keywords mk ON mk.movie_id = m.id
            JOIN keywords k ON k.id = mk.keyword_id
            GROUP BY k.keyword
            ORDER BY count desc
            LIMIT 10
            `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    keyword: "woman director",
                    count: 411
                },
                {
                    keyword: "independent film",
                    count: 394
                },
                {
                    keyword: "based on novel",
                    count: 278
                },
                {
                    keyword: "sex",
                    count: 272
                },
                {
                    keyword: "sport",
                    count: 216
                },
                {
                    keyword: "murder",
                    count: 204
                },
                {
                    keyword: "musical",
                    count: 169
                },
                {
                    keyword: "biography",
                    count: 168
                },
                {
                    keyword: "new york",
                    count: 163
                },
                {
                    keyword: "suspense",
                    count: 157
                }
            ]);
            done();
        },
        minutes(3)
    );

    it(
        "should select one movie which has highest count of actors",
        async done => {
            const query = `
            SELECT count(*) AS count, m.original_title AS original_title
            FROM movies m
            JOIN movie_actors ma ON ma.movie_id = m.id
            GROUP BY m.original_title
            ORDER BY count desc
            LIMIT 1
            `;
            const result = await db.selectSingleRow(query);

            expect(result).toEqual({
                original_title: "Hamlet",
                count: 20
            });
            done();
        },
        minutes(3)
    );

    it(
        "should select three genres which has most ratings with 5 stars",
        async done => {
            const query = `
            SELECT count(*) AS five_stars_count, g.genre AS genre
            FROM movies m
            JOIN movie_ratings mr ON mr.movie_id = m.id
            JOIN movie_genres mg ON mg.movie_id = m.id
            JOIN genres g ON g.id = mg.genre_id
            WHERE mr.rating >= 5
            GROUP BY genre
            ORDER BY five_stars_count DESC
            LIMIT 3
            `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    genre: 'Drama',
                    five_stars_count: 143663
                },
                {
                    genre: 'Thriller',
                    five_stars_count: 96265
                },
                {
                    genre: 'Comedy',
                    five_stars_count: 81184
                },
            ]);
            done();
        },
        minutes(3)
    );

    it(
        "should select top three production companies with most movies produced",
        async done => {
            const query = `
            SELECT count(1) as movie_count, pc.company_name as company_name
            FROM movies m
            JOIN movie_production_companies mpc on mpc.movie_id = m.id
            JOIN production_companies pc on pc.id = mpc.company_id
            GROUP BY company_name
            ORDER BY movie_count DESC
            Limit 3
            `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    movie_count: 520,
                    company_name: 'Universal Pictures'
                },
                {
                    movie_count: 506,
                    company_name: 'Warner Bros.'
                },
                {
                    movie_count: 430,
                    company_name: 'Paramount Pictures'
                },
            ]);
            done();
        },
        minutes(3)
    );

    it(
        "should select top three grossing production companies (by adjusted revenue)",
        async done => {
            const query = `
            SELECT round(sum(m.revenue_adjusted), 2) as total_revenue, pc.company_name as company_name
            FROM movies m
            JOIN movie_production_companies mpc on mpc.movie_id = m.id
            JOIN production_companies pc on pc.id = mpc.company_id
            GROUP BY company_name
            ORDER BY total_revenue DESC
            Limit 3
            `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    total_revenue: 70759770415.2,
                    company_name: 'Warner Bros.'
                },
                {
                    total_revenue: 64287281349.44,
                    company_name: 'Universal Pictures'
                },
                {
                    total_revenue: 57250933984.63,
                    company_name: 'Paramount Pictures'
                },
            ]);
            done();
        },
        minutes(3)
    );

    it(
        "should select top three actors rated by movie revenue (adjusted) they starred in (in Billion)",
        async done => {
            const query = `
            SELECT round(sum(m.revenue_adjusted) / 1000000000, 2) || ' bil.' as total_movie_revenue, a.full_name as actor_name
            FROM movies m
            JOIN movie_actors ma on ma.movie_id = m.id
            JOIN actors a on a.id = ma.actor_id
            GROUP BY actor_name
            ORDER BY round(sum(m.revenue_adjusted) / 1000000000, 2) DESC
            Limit 3
            `;
            const result = await db.selectMultipleRows(query);

            expect(result).toEqual([
                {
                    total_movie_revenue: '14.59 bil.',
                    actor_name: 'Harrison Ford'
                },
                {
                    total_movie_revenue: '10.67 bil.',
                    actor_name: 'Tom Hanks'
                },
                {
                    total_movie_revenue: '10.56 bil.',
                    actor_name: 'Tom Cruise'
                },
            ]);
            done();
        },
        minutes(3)
    );
});
