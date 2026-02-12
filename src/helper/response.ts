const response = (payload: object, status: number, message: string) => { // Standard response format

    const print = {
        status: 'Success',
        statusCode: status,
        data: payload,
        message: message || null,
    };

    return print;
};

export default response;